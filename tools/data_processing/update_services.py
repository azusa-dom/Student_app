#!/usr/bin/env python3
# scripts/update_services.py
import json
from pathlib import Path
from datetime import datetime, timezone
import scrapy
from scrapy.crawler import CrawlerProcess

# ====================== 1. 历史记录 ======================
HISTORY_FILE = 'data/supplement/ucl_services_history.json'
Path(HISTORY_FILE).parent.mkdir(parents=True, exist_ok=True)

if Path(HISTORY_FILE).exists():
    with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
        history = json.load(f)
else:
    history = {}

# ====================== 2. 爬虫 ======================
class UCLServicesIncrementalSpider(scrapy.Spider):
    name = 'ucl_services_inc'
    allowed_domains = ['ucl.ac.uk']
    start_urls = [
        'https://www.ucl.ac.uk/careers',
        'https://www.ucl.ac.uk/students/support-and-wellbeing-services',
        # 在这里继续添加你需要监控的页面
    ]

    custom_settings = {
        'DOWNLOAD_DELAY': 1,
        'USER_AGENT': 'CampusApp-Updater (contact@example.com)',
        'FEEDS': {
            'data/supplement/ucl_services_incremental.jsonl': {
                'format': 'jsonlines',
                'overwrite': True,
                'encoding': 'utf8',
            }
        }
    }

    def parse(self, response):
        url = response.url
        last_modified = response.headers.get('Last-Modified')
        if last_modified:
            last_modified = last_modified.decode()
        else:
            last_modified = datetime.now(timezone.utc).isoformat()

        # 增量判断
        if url in history and last_modified <= history[url]:
            return

        title = (response.css('h1::text').get() or 'Unknown').strip()
        description = ' '.join(response.css('p::text').getall())[:1000]
        contact = ' '.join(response.css('.contact::text').getall()).strip() or 'Check website.'
        how_to_access = 'See website for details.'

        url_lower = url.lower()
        category = 'Support'
        if 'career' in url_lower: category = 'Careers'
        elif 'health' in url_lower: category = 'Wellbeing'
        elif 'event' in url_lower: category = 'Events'

        yield {
            'url': url,
            'service_name': title,
            'category': category,
            'description': description,
            'how_to_access': how_to_access,
            'contact': contact,
            'last_crawled_at': datetime.now(timezone.utc).isoformat(),
            'last_modified': last_modified
        }

        # 更新历史
        history[url] = last_modified

# ====================== 3. 合并增量到主文件 ======================
def merge_incremental():
    inc_file = Path('data/supplement/ucl_services_incremental.jsonl')
    main_file = Path('data/ucl_services_clean.jsonl')
    if not inc_file.exists():
        return

    main_data = {}
    if main_file.exists():
        with main_file.open('r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    item = json.loads(line)
                    main_data[item['url']] = item

    with inc_file.open('r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                item = json.loads(line)
                main_data[item['url']] = item

    with main_file.open('w', encoding='utf-8') as f:
        for item in main_data.values():
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    print(f"合并完成：{len(main_data)} 条服务")

# ====================== 4. 主程序 ======================
if __name__ == '__main__':
    process = CrawlerProcess()
    process.crawl(UCLServicesIncrementalSpider)
    process.start()

    # 保存历史
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)
    print(f"历史记录已更新：{len(history)} 页面")

    # 自动合并
    merge_incremental()