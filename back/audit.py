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
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"                                 
        }                                                                                                                      
                                                                                                                                 
        try:                                                                                                                   
            response = requests.get(self.url, headers=headers, timeout=10)                                                     
            response.raise_for_status()                                                                                        
        except requests.RequestException as e:                                                                                 
            self.data["error"] = str(e)                                                                                        
            self.data["description"] = ""                                                                                      
            self.data["price"] = 0                                                                                             
            return                                                                                                             
                                                                                                                                 
        soup = BeautifulSoup(response.text, 'html.parser')                                                                     
                                                                                                                                 
        # Extract Price (Craigslist)                                                                                           
        price_tag = soup.find(class_='price')                                                                                  
        if price_tag:                                                                                                          
            price_text = price_tag.text                                                                                        
            numbers = re.findall(r'\d+', price_text.replace(',', ''))                                                          
            self.data['price'] = int(numbers[0]) if numbers else 0                                                             
        else:                                                                                                                  
            self.data['price'] = 0                                                                                             
                                                                                                                                 
          # Extract Description                                                                                                  
        desc = soup.find(id='postingbody')                                                                                     
        self.data['description'] = desc.get_text(strip=True) if desc else ""                                                   
                                                                                                                                 
        # Extract Neighborhood                                                                                                 
        hood = soup.find('small')                                                                                              
        if hood:                                                                                                               
            hood_text = hood.get_text(strip=True)                                                                              
            self.data['neighborhood'] = hood_text.strip('() ')                                                                 
        else:                                                                                                                  
            self.data['neighborhood'] = "Unknown"                                                                              
                                                                                                                                 
    def run_scam_analysis(self):                                                                                               
        """Analyze data for red flags"""                                                                                       
        scam_score = 100                                                                                                       
                                                                                                                                 
        description = self.data.get('description', '').lower()                                                                 
                                                                                                                                 
        # Keyword Check                                                                                                        
        scam_keywords = [                                                                                                      
            'whatsapp', 'western union', 'shipping', 'urgent',                                                                 
            'wire transfer', 'money order', 'overseas', 'nigeria',                                                             
            'send money', 'deposit first', 'cant meet', "can't meet"                                                           
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
                                 