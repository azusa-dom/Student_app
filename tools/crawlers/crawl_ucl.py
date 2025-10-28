import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime, timezone
import logging

class ProgramItem(scrapy.Item):
    source = scrapy.Field()
    school = scrapy.Field()
    type = scrapy.Field()
    title = scrapy.Field()
    url = scrapy.Field()
    sections = scrapy.Field()
    last_crawled_at = scrapy.Field()

class UclProgramSpider(scrapy.Spider):
    name = 'ucl_program'
    allowed_domains = ['ucl.ac.uk']
    start_urls = [
        'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees',
        'https://www.ucl.ac.uk/prospective-students/undergraduate/degrees'
    ]

    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'USER_AGENT': 'CampusApp-Crawler (your-email@example.com)',
        'LOG_LEVEL': 'INFO',
        'ROBOTSTXT_OBEY': True,
        'CONCURRENT_REQUESTS': 1,
        'COOKIES_ENABLED': False,
        'RETRY_TIMES': 3
    }

    def parse(self, response):
        """解析课程列表页面"""
        # 查找所有课程链接
        course_links = response.css('a[href*="/prospective-students/"][href$="-msc"], ' +
                                  'a[href*="/prospective-students/"][href$="-bsc"], ' +
                                  'a[href*="/prospective-students/"][href$="-ba"], ' +
                                  'a[href*="/prospective-students/"][href$="-ma"]')
        
        # 访问每个课程页面
        for link in course_links:
            url = response.urljoin(link.attrib['href'])
            yield scrapy.Request(url, callback=self.parse_course)
            
        # 查找下一页链接（如果存在）
        next_page = response.css('a.pagination__next::attr(href)').get()
        if next_page:
            yield scrapy.Request(response.urljoin(next_page), callback=self.parse)

    def parse_course(self, response):
        """解析单个课程页面"""
        try:
            item = ProgramItem()
            item['source'] = 'web'
            item['school'] = 'ucl'
            item['type'] = 'program'
            item['url'] = response.url
            title = (response.css('h1::text').get() or response.css('title::text').get() or 'No Title').strip()
            item['title'] = title
            item['last_crawled_at'] = datetime.now(timezone.utc).isoformat()

            sections = []
            keywords = ['overview', 'about', 'summary', 'admissions', 'entry', 'requirements',
                       'modules', 'structure', 'content', 'assessment', 'examination',
                       'research', 'dissertation', 'project', 'careers', 'employment',
                       'fees', 'funding', 'scholarship', 'staff', 'faculty', 'teaching',
                       'international', 'english', 'contact', 'location']
            
            seen_headings = set()
            for h in response.css('h1, h2, h3, h4, .section-title, .content-title'):
                heading = h.css('::text').get(default='').strip().lower()
                if not heading or heading in seen_headings or not any(k in heading for k in keywords):
                    continue
                seen_headings.add(heading)

                text_parts = []
                for elem in h.xpath('following-sibling::*[not(self::h1 or self::h2 or self::h3 or self::h4)][position() <= 10]'):
                    if elem.xpath('descendant-or-self::*[contains(@class, "nav") or contains(@class, "menu")]'):
                        continue
                    texts = elem.css('::text, li::text').getall()
                    text_parts.extend([t.strip() for t in texts if t.strip()])

                text = ' '.join(text_parts).strip()
                if text and len(text) > 30:
                    sections.append({'heading': heading.capitalize(), 'text': text})
            
            if sections:
                item['sections'] = sections
                yield item
            else:
                self.logger.warning(f"No relevant sections found in {response.url}")
                
        except Exception as e:
            self.logger.error(f"Error processing {response.url}: {str(e)}")
            return

if __name__ == "__main__":
    process = CrawlerProcess({
        'FEED_FORMAT': 'jsonlines',
        'FEED_URI': 'data/ucl_raw.jsonl'
    })
    process.crawl(UclProgramSpider)
    process.start()
