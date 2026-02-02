import requests
from bs4 import BeautifulSoup
import re

class PropertyAuditEngine:
    def __init__(self, url):
        self.url = url
        self.data = {}

    def fetch_listing(self):
        """Scrape basic data from the listing"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        try:
            response = requests.get(self.url, headers=headers, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            self.data["error"] = str(e)
            self.data["description"] = ""
            self.data["price"] = 0
            self.data["neighborhood"] = "Unknown"
            return

        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract Price - try multiple selectors
        price = 0
        price_selectors = [
            ('class', 'price'),
            ('class', 'postingtitletext'),
            ('class', 'attrgroup'),
        ]
        for selector_type, selector_value in price_selectors:
            tag = soup.find(class_=selector_value)
            if tag:
                numbers = re.findall(r'\$[\d,]+', tag.get_text())
                if numbers:
                    price = int(numbers[0].replace('$', '').replace(',', ''))
                    break
        # Fallback: search entire page for price pattern
        if price == 0:
            page_text = soup.get_text()
            prices = re.findall(r'\$(\d{1,2},?\d{3})', page_text)
            if prices:
                price = int(prices[0].replace(',', ''))
        self.data['price'] = price

        # Extract Description
        desc = soup.find(id='postingbody')
        if not desc:
            desc = soup.find(class_='body')
        self.data['description'] = desc.get_text(strip=True) if desc else ""

        # Extract Neighborhood - try multiple approaches
        neighborhood = "Unknown"

        # Try 1: Look for neighborhood in title area
        title_area = soup.find(class_='postingtitletext')
        if title_area:
            small_tag = title_area.find('small')
            if small_tag:
                neighborhood = small_tag.get_text(strip=True).strip('() ')

        # Try 2: Look in mapaddress
        if neighborhood == "Unknown":
            map_addr = soup.find(class_='mapaddress')
            if map_addr:
                neighborhood = map_addr.get_text(strip=True)

        # Try 3: Look for any location data in meta tags
        if neighborhood == "Unknown":
            geo_region = soup.find('meta', {'name': 'geo.region'})
            if geo_region and geo_region.get('content'):
                neighborhood = geo_region.get('content')

        # Try 4: Extract from breadcrumbs or header
        if neighborhood == "Unknown":
            breadcrumbs = soup.find(class_='breadcrumbs')
            if breadcrumbs:
                links = breadcrumbs.find_all('a')
                if len(links) >= 2:
                    neighborhood = links[-1].get_text(strip=True)

        self.data['neighborhood'] = neighborhood

    def run_scam_analysis(self):
        """Analyze data for red flags"""
        scam_score = 100

        description = self.data.get('description', '').lower()

        # Keyword Check
        scam_keywords = [
            'whatsapp', 'western union', 'shipping', 'urgent',
            'wire transfer', 'money order', 'overseas', 'nigeria',
            'send money', 'deposit first', 'cant meet', "can't meet",
            'god bless', 'currently out', 'out of town', 'out of country'
        ]

        for word in scam_keywords:
            if word in description:
                scam_score -= 15

        # Price too low = suspicious
        price = self.data.get('price', 0)
        if price > 0 and price < 500:
            scam_score -= 30

        # Clamp score between 0-100
        scam_score = max(0, min(100, scam_score))

        self.data['scam_score'] = scam_score
        return self.data
