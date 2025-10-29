# scripts/supplement_assessment.py
# 终极增量补爬：补全 Assessment + Structure
# 输入：data/missing_assessment_urls.txt
# 输出：data/supplement/assessment_supplement.jsonl

import scrapy
from scrapy.crawler import CrawlerProcess
from datetime import datetime, timezone
import re
from pathlib import Path

class SupplementSpider(scrapy.Spider):
    name = 'ucl_supplement'
    allowed_domains = ['ucl.ac.uk']
    custom_settings = {
        'DOWNLOAD_DELAY': 1,
        'USER_AGENT': 'CampusApp-Crawler (your-email@example.com)',
        'LOG_LEVEL': 'INFO',
        'ROBOTSTXT_OBEY': True,
        'CONCURRENT_REQUESTS': 4,
        'COOKIES_ENABLED': False,
        'RETRY_TIMES': 2
    }

    def __init__(self):
        super().__init__()
        try:
            with open('data/missing_assessment_urls.txt', 'r') as f:
                urls = [url.strip() for url in f.readlines() if url.strip()]
            # 去重
            self.start_urls = list(dict.fromkeys(urls))
            self.logger.info(f"Loaded {len(self.start_urls)} URLs for supplement crawling")
        except FileNotFoundError:
            self.logger.error("data/missing_assessment_urls.txt not found!")
            self.start_urls = []

    def parse(self, response):
        try:
            url = response.url
            raw_text = ' '.join(response.xpath('//text()').getall()).lower()
            sections = []

            assessment_keywords = [
                'assessment', 'examination', 'evaluated', 'coursework',
                'dissertation', 'thesis', 'project work', 'evaluation',
                'graded', 'marking', 'exam', 'test', 'assignment'
            ]
            structure_keywords = [
                'structure', 'curriculum', 'programme structure',
                'course structure', 'study structure', 'year', 'term',
                'module', 'core', 'optional', 'elective'
            ]

            # === 策略1：精准匹配标题 ===
            for h in response.css('h1, h2, h3, h4, .section-title, .content-title, .accordion-header'):
                heading = h.css('::text').get(default='').strip()
                if not heading:
                    continue
                heading_lower = heading.lower()

                is_assessment = any(kw in heading_lower for kw in assessment_keywords)
                is_structure = any(kw in heading_lower for kw in structure_keywords)

                if not (is_assessment or is_structure):
                    continue

                text_parts = []
                for elem in h.xpath('following-sibling::*[not(self::h1 or self::h2 or self::h3 or self::h4)][position() <= 15]'):
                    if elem.xpath('descendant-or-self::*[contains(@class, "nav") or contains(@class, "menu")]'):
                        continue
                    texts = elem.css('::text, li::text, p::text').getall()
                    text_parts.extend([t.strip() for t in texts if t.strip() and len(t) > 3])

                text = ' '.join(text_parts)[:2000].strip()
                if text:
                    sections.append({
                        'heading': heading.strip(),
                        'text': text
                    })

            # === 策略2：正则兜底 - Assessment ===
            if not any('assessment' in s['heading'].lower() for s in sections):
                patterns = [
                    r'(assessment.{0,100}?(?:by|is|includes|consists|comprises))',
                    r'(examination.{0,100}?)',
                    r'(coursework.{0,100}?)',
                    r'(how.{0,50}?you.{0,50}?will.{0,50}?be.{0,50}?assessed)',
                    r'(grading.{0,100}?)'
                ]
                for pat in patterns:
                    match = re.search(pat, raw_text, re.I | re.DOTALL)
                    if match:
                        start = max(0, match.start() - 200)
                        end = min(len(raw_text), match.end() + 600)
                        para = raw_text[start:end]
                        para = re.sub(r'\s+', ' ', para).strip()
                        if len(para) > 50:
                            sections.append({
                                'heading': 'Assessment',
                                'text': para[:1500]
                            })
                        break

            # === 策略3：正则兜底 - Structure ===
            if not any('structure' in s['heading'].lower() for s in sections):
                struct_pat = r'(year \d|term \d|module.{0,50}?(?:list|overview|core|optional))'
                match = re.search(struct_pat, raw_text, re.I)
                if match:
                    start = max(0, match.start() - 300)
                    end = min(len(raw_text), match.end() + 1000)
                    para = raw_text[start:end]
                    para = re.sub(r'\s+', ' ', para).strip()
                    if len(para) > 100:
                        sections.append({
                            'heading': 'Programme Structure',
                            'text': para[:1800]
                        })

            # === 输出 ===
            if sections:
                yield {
                    'url': url,
                    'sections': sections,
                    'last_crawled_at': datetime.now(timezone.utc).isoformat()
                }
            else:
                self.logger.warning(f"No relevant sections found in {url}")

        except Exception as e:
            self.logger.error(f"Error processing {url}: {str(e)}")

def run_spider():
    Path('data/supplement').mkdir(parents=True, exist_ok=True)
    process = CrawlerProcess({
        'FEED_FORMAT': 'jsonlines',
        'FEED_URI': 'data/supplement/assessment_supplement.jsonl'
    })
    process.crawl(SupplementSpider)
    process.start()

if __name__ == "__main__":
    run_spider()