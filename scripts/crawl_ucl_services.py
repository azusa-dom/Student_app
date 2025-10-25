# scripts/crawl_ucl_services.py
import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime, timezone

class UCLServicesSpider(scrapy.Spider):
    name = 'ucl_services'
    allowed_domains = ['ucl.ac.uk']
    start_urls = [
        'https://www.ucl.ac.uk/careers',
        'https://www.ucl.ac.uk/students/support-and-wellbeing-services',
        'https://www.ucl.ac.uk/students/support-and-wellbeing-services/health-and-disability-services',
        'https://www.ucl.ac.uk/students/support-and-wellbeing-services/mental-health-and-wellbeing',
        'https://www.ucl.ac.uk/students/events',
        # ... 其他 URL 保持不变
    ]

    custom_settings = {
        'DOWNLOAD_DELAY': 1,
        'USER_AGENT': 'CampusApp-Crawler (your-email@example.com)',
        'LOG_LEVEL': 'INFO',
        'ROBOTSTXT_OBEY': True,
        'CONCURRENT_REQUESTS': 1,
        'RETRY_TIMES': 3,
        'FEEDS': {
            'data/supplement/ucl_services_raw.jsonl': {
                'format': 'jsonlines',
                'encoding': 'utf8',
                'overwrite': True,
            }
        }
    }

    def parse(self, response):
        title = (response.css('h1::text').get() or 
                 response.css('title::text').get() or 
                 'Unknown Service').strip()

        # 提取描述
        desc_selectors = ['p::text', '.content p::text', '.description p::text']
        description = ' '.join([
            text.strip() for sel in desc_selectors
            for text in response.css(sel).getall()
            if text.strip()
        ])[:1000]

        # 提取联系方式
        contact = ' '.join(response.css('.contact::text, .contact-info::text').getall()).strip()
        if not contact:
            contact = 'Check website.'

        # 提取访问方式
        access = ' '.join(response.css('.how-to-access::text, .access::text').getall()).strip()
        if not access:
            access = 'See website for details.'

        # 分类
        url = response.url.lower()
        if any(k in url for k in ['career', 'employ']):
            category = 'Careers'
        elif any(k in url for k in ['health', 'wellbeing', 'disability']):
            category = 'Wellbeing'
        elif 'event' in url:
            category = 'Events'
        else:
            category = 'Support'

        # === 关键：用 yield 输出 ===
        yield {
            'source': 'web',
            'school': 'ucl',
            'url': response.url,
            'service_name': title,
            'category': category,
            'description': description,
            'how_to_access': access,
            'contact': contact,
            'last_crawled_at': datetime.now(timezone.utc).isoformat()
        }

        # 递归爬子页面
        if response.meta.get('depth', 0) < 2:
            for href in response.css('a::attr(href)').getall():
                if href and href.startswith('/') and not href.startswith('//'):
                    full_url = response.urljoin(href)
                    if ('ucl.ac.uk' in full_url and 
                        any(k in full_url.lower() for k in ['support', 'wellbeing', 'careers', 'events'])):
                        yield response.follow(full_url, self.parse, meta={'depth': response.meta.get('depth', 0) + 1})

# === 运行 ===
if __name__ == "__main__":
    process = CrawlerProcess()
    process.crawl(UCLServicesSpider)
    process.start()