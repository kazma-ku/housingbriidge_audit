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
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }

        try:
            response = requests.get(self.url, headers=headers, timeout=15)
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
        price_selectors = ['price', 'postingtitletext', 'attrgroup']
        for selector_value in price_selectors:
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

        # Extract Neighborhood - try multiple approaches (most specific first)
        neighborhood = "Unknown"

        # Try 1: Look in mapaddress (most specific - actual street address)
        map_addr = soup.find(class_='mapaddress')
        if map_addr:
            addr_text = map_addr.get_text(strip=True)
            if addr_text and len(addr_text) > 3:
                neighborhood = addr_text

        # Try 2: Look for neighborhood in title area (in parentheses)
        if neighborhood == "Unknown":
            title_area = soup.find(class_='postingtitletext')
            if title_area:
                small_tag = title_area.find('small')
                if small_tag:
                    hood_text = small_tag.get_text(strip=True).strip('() ')
                    if hood_text and len(hood_text) > 2:
                        neighborhood = hood_text

        # Try 3: Extract location from description text (most useful for specific locations)
        if neighborhood == "Unknown":
            desc_text = self.data.get('description', '')
            found_location = None

            # Priority 1: Look for area names in parentheses like "(Cambie Village area)"
            area_match = re.search(r'\(([A-Z][a-zA-Z\s]+(?:area|village|heights|district))\)', desc_text, re.IGNORECASE)
            if area_match:
                found_location = area_match.group(1).strip()

            # Priority 2: Look for street intersection patterns like "18th Avenue and Cambie"
            if not found_location:
                street_match = re.search(r'(\d+(?:st|nd|rd|th)?\s+(?:Ave|Avenue|St|Street|Drive|Road|Way|Blvd)\s+(?:and|&)\s+[A-Z][a-zA-Z]+)', desc_text, re.IGNORECASE)
                if street_match:
                    found_location = street_match.group(1).strip()

            # Priority 3: Look for "in [Location]" patterns
            if not found_location:
                location_match = re.search(r'(?:in|at|near)\s+([A-Z][a-zA-Z\s]+(?:Vancouver|Burnaby|Richmond|Surrey|Coquitlam|Westminster))', desc_text)
                if location_match:
                    found_location = location_match.group(1).strip()

            if found_location:
                neighborhood = found_location

        # Try 4: Look for location in attrgroup
        if neighborhood == "Unknown":
            skip_words = ['parking', 'laundry', 'washer', 'dryer', 'furnished', 'renovated', 'bedroom', 'bathroom', 'kitchen', 'floor', 'unit', 'apartment', 'suite', 'rent', 'lease', 'deposit', 'available', 'included', 'utilities']
            location_words = ['near', 'downtown', 'west van', 'east van', 'north van', 'burnaby', 'richmond', 'surrey', 'coquitlam', 'new west', 'kitsilano', 'kerrisdale', 'marpole', 'cambie', 'main st', 'commercial', 'metrotown', 'ubc', 'sfu']
            for attr in soup.find_all(class_='attrgroup'):
                spans = attr.find_all('span')
                for span in spans:
                    text = span.get_text(strip=True)
                    text_lower = text.lower()
                    if any(skip in text_lower for skip in skip_words):
                        continue
                    if text and not text.startswith(('$', 'ft', 'br', 'ba')):
                        if any(word in text_lower for word in location_words):
                            neighborhood = text
                            break

        # Try 5: Extract from page title (before the dash)
        if neighborhood == "Unknown":
            title_tag = soup.find('title')
            if title_tag:
                title_text = title_tag.get_text()
                if ' - ' in title_text:
                    location_part = title_text.split(' - ')[0].strip()
                    location_part = re.sub(r'\s*\([^)]*\)\s*', '', location_part).strip()
                    if location_part and len(location_part) > 3:
                        neighborhood = location_part

        # Try 6: Look for geo.placename meta tag
        if neighborhood == "Unknown":
            geo_place = soup.find('meta', {'name': 'geo.placename'})
            if geo_place and geo_place.get('content'):
                neighborhood = geo_place.get('content')

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
