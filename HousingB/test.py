import requests
from bs4 import BeautifulSoup

# 条件：バンクーバー、家賃1000ドル以下、アパート・住宅
URL = "https://vancouver.craigslist.org/search/van/apa?max_price=1000#search=1~gallery~0~0"

def scrape_vancouver_housing():
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Craigslistの新しい構造に合わせて検索結果を抽出
        # ※サイトの構造が頻繁に変わるため、クラス名は適宜調整が必要
        postings = soup.find_all('li', class_='cl-static-search-result')
        
        print(f"--- 検索結果: {len(postings)}件 ---")
        
        for post in postings:
            title = post.get('title')
            price_tag = post.find('div', class_='price')
            price = price_tag.text if price_tag else "価格不明"
            link = post.find('a')['href']
            
            print(f"【{price}】 {title}")
            print(f"URL: {link}\n")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")

if __name__ == "__main__":
    scrape_vancouver_housing()