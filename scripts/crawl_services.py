# scripts/crawl_services.py
# 爬取 UCL 学生服务：职业、CV、健康、活动等
# 输出：data/supplement/ucl_services_raw.jsonl → data/ucl_services_clean.jsonl
# 已优化：自动创建目录 + 统一路径 + 健壮性

import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime, timezone
from pathlib import Path
import re

class ServiceItem(scrapy.Item):
    source = scrapy.Field()
    school = scrapy.Field()
    service_name = scrapy.Field()
    category = scrapy.Field()
    description = scrapy.Field()
    how_to_access = scrapy.Field()
    contact = scrapy.Field()
    url = scrapy.Field()
    last_crawled_at = scrapy.Field()

class UCLServicesSpider(scrapy.Spider):
    name = 'ucl_services'
    allowed_domains = ['ucl.ac.uk']
    start_urls = [
        'https://www.ucl.ac.uk/students/support-services',
        'https://www.ucl.ac.uk/careers',
        'https://www.ucl.ac.uk/students/student-wellbeing',
        'https://www.ucl.ac.uk/students/student-centre',
        'https://www.ucl.ac.uk/students/disability-support',
        'https://www.ucl.ac.uk/careers/appointments',
        'https://www.ucl.ac.uk/careers/cv-support',
        'https://www.ucl.ac.uk/students/support-services/appointments',
        'https://www.ucl.ac.uk/students/health-and-wellbeing',
        'https://www.ucl.ac.uk/students/events',
    ]

    custom_settings = {
        'DOWNLOAD_DELAY': 1.5,
        'USER_AGENT': 'CampusApp-ServicesCrawler (contact: your-email@example.com)',
        'CONCURRENT_REQUESTS': 3,
        'ROBOTSTXT_OBEY': True,
        'RETRY_TIMES': 2,
        'LOG_LEVEL': 'INFO'
    }

    def parse(self, response):
        service_links = response.css('a::attr(href)').re(r'.*(careers|wellbeing|support|appointment|cv|event|health).*')
        service_links = [response.urljoin(link) for link in service_links if '/students/' in link or '/careers/' in link]
        service_links = list(set(service_links))[:20]

        for link in service_links:
            yield scrapy.Request(link, callback=self.parse_service_page, errback=self.errback)

        yield from self.parse_service_page(response)

    def parse_service_page(self, response):
        try:
            item = ServiceItem()
            item['source'] = 'web'
            item['school'] = 'ucl'
            item['url'] = response.url
            item['last_crawled_at'] = datetime.now(timezone.utc).isoformat()

            title = response.css('h1::text, .page-title::text').get(default='').strip()
            if not title:
                title = response.css('title::text').get(default='').strip().split('|')[0]
            item['service_name'] = title

            if 'career' in response.url or 'cv' in response.url:
                item['category'] = 'Careers'
            elif 'wellbeing' in response.url or 'health' in response.url:
                item['category'] = 'Wellbeing'
            elif 'event' in response.url:
                item['category'] = 'Events'
            else:
                item['category'] = 'Support'

            text = ' '.join(response.xpath('//main//text() | //article//text()').getall())
            text = re.sub(r'\s+', ' ', text).strip()

            access_patterns = [
                r'(book.{0,50}?(?:appointment|session))',
                r'(how to.{0,50}?(?:access|use|book))',
                r'(contact.{0,50}?(?:us|team))',
                r'(email.{0,50}?:[^.\s]+@[^.\s]+\.[^.\s]+)',
                r'(phone.{0,50}?:\s*[\d+\-\s()]+)'
            ]
            how_to_access = ''
            for pat in access_patterns:
                m = re.search(pat, text, re.I)
                if m:
                    start = max(0, m.start() - 100)
                    end = min(len(text), m.end() + 200)
                    how_to_access = text[start:end].strip()
                    break
            item['how_to_access'] = how_to_access or 'See website for details.'

            email = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
            phone = re.search(r'(\+?\d[\d\s\-\(\)]{8,})', text)
            contact = []
            if email:
                contact.append(f"Email: {email.group(0)}")
            if phone:
                contact.append(f"Phone: {phone.group(0)}")
            item['contact'] = '; '.join(contact) if contact else 'Check website.'

            desc = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+|\+?\d[\d\s\-\(\)]{8,}', '', text)
            item['description'] = desc[:800].strip()

            if item['service_name'] and len(item['description']) > 50:
                yield item
        except Exception as e:
            self.logger.error(f"Parse error {response.url}: {e}")

    def errback(self, failure):
        self.logger.error(f"Request failed: {failure.request.url}")

def run_services_crawler():
    output_dir = Path('data/supplement')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    process = CrawlerProcess({
        'FEED_FORMAT': 'jsonlines',
        'FEED_URI': str(output_dir / 'ucl_services_raw.jsonl')
    })
    process.crawl(UCLServicesSpider)
    process.start()

if __name__ == '__main__':
    run_services_crawler()