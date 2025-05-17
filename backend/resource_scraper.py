import requests
from bs4 import BeautifulSoup
import re
import logging
import json
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

class ResourceScraper:
    """Class for scraping learning resources from various websites"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.data_folder = 'data/resources'
        import os
        os.makedirs(self.data_folder, exist_ok=True)
    
    async def search_udemy(self, skill: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for courses on Udemy"""
        try:
            search_term = quote_plus(skill)
            url = f"https://www.udemy.com/courses/search/?src=ukw&q={search_term}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch Udemy results: Status {response.status}")
                        return []
                    
                    html = await response.text()
            
            soup = BeautifulSoup(html, 'html.parser')
            courses = []
            
            # Parse course cards
            course_elements = soup.select('.course-card-container')[:max_results]
            
            for element in course_elements:
                try:
                    title_element = element.select_one('.course-card--course-title')
                    link_element = element.select_one('a')
                    rating_element = element.select_one('.star-rating--rating-number')
                    reviews_element = element.select_one('.course-card--reviews-text')
                    instructor_element = element.select_one('.course-card--instructor-text')
                    price_element = element.select_one('.price-text--price-part')
                    
                    if not title_element or not link_element:
                        continue
                    
                    title = title_element.text.strip()
                    url = f"https://www.udemy.com{link_element.get('href')}"
                    rating = float(rating_element.text.strip()) if rating_element else None
                    
                    reviews_text = reviews_element.text.strip() if reviews_element else "0 reviews"
                    reviews_count = int(re.search(r'(\d+)', reviews_text).group(1)) if re.search(r'(\d+)', reviews_text) else 0
                    
                    instructor = instructor_element.text.strip() if instructor_element else "Unknown Instructor"
                    price = price_element.text.strip() if price_element else "Unknown Price"
                    
                    courses.append({
                        'title': title,
                        'url': url,
                        'rating': rating,
                        'reviews_count': reviews_count,
                        'instructor': instructor,
                        'price': price,
                        'source': 'Udemy',
                        'resource_type': 'course',
                        'price_type': 'paid' if price and 'free' not in price.lower() else 'free',
                        'skill': skill
                    })
                except Exception as e:
                    logger.error(f"Error parsing Udemy course: {str(e)}")
            
            return courses
        except Exception as e:
            logger.error(f"Error searching Udemy: {str(e)}")
            return []
    
    async def search_coursera(self, skill: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for courses on Coursera"""
        try:
            search_term = quote_plus(skill)
            url = f"https://www.coursera.org/search?query={search_term}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch Coursera results: Status {response.status}")
                        return []
                    
                    html = await response.text()
            
            soup = BeautifulSoup(html, 'html.parser')
            courses = []
            
            # Parse course cards
            course_elements = soup.select('.cds-ProductCard-gridCard')[:max_results]
            
            for element in course_elements:
                try:
                    title_element = element.select_one('.cds-CommonCard-title')
                    link_element = element.select_one('a')
                    provider_element = element.select_one('.cds-CommonCard-context')
                    
                    if not title_element or not link_element:
                        continue
                    
                    title = title_element.text.strip()
                    url = f"https://www.coursera.org{link_element.get('href')}"
                    provider = provider_element.text.strip() if provider_element else "Unknown Provider"
                    
                    courses.append({
                        'title': title,
                        'url': url,
                        'provider': provider,
                        'source': 'Coursera',
                        'resource_type': 'course',
                        'price_type': 'mixed',  # Coursera offers both free and paid options
                        'skill': skill
                    })
                except Exception as e:
                    logger.error(f"Error parsing Coursera course: {str(e)}")
            
            return courses
        except Exception as e:
            logger.error(f"Error searching Coursera: {str(e)}")
            return []
    
    async def search_github(self, skill: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for repositories on GitHub"""
        try:
            search_term = quote_plus(f"{skill} awesome")
            url = f"https://github.com/search?q={search_term}&type=repositories"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch GitHub results: Status {response.status}")
                        return []
                    
                    html = await response.text()
            
            soup = BeautifulSoup(html, 'html.parser')
            resources = []
            
            # Parse repo cards
            repo_elements = soup.select('.repo-list-item')[:max_results]
            
            for element in repo_elements:
                try:
                    name_element = element.select_one('.f4 a')
                    description_element = element.select_one('.mb-1')
                    stars_element = element.select_one('a[href*="stargazers"]')
                    
                    if not name_element:
                        continue
                    
                    title = name_element.text.strip()
                    url = f"https://github.com{name_element.get('href')}"
                    description = description_element.text.strip() if description_element else ""
                    
                    stars_text = stars_element.text.strip() if stars_element else "0"
                    stars = int(re.sub(r'[^\d]', '', stars_text)) if re.sub(r'[^\d]', '', stars_text) else 0
                    
                    resources.append({
                        'title': title,
                        'url': url,
                        'description': description,
                        'rating': stars / 1000,  # Normalize stars as a form of rating
                        'source': 'GitHub',
                        'resource_type': 'repository',
                        'price_type': 'free',
                        'skill': skill
                    })
                except Exception as e:
                    logger.error(f"Error parsing GitHub repository: {str(e)}")
            
            return resources
        except Exception as e:
            logger.error(f"Error searching GitHub: {str(e)}")
            return []
    
    async def search_youtube(self, skill: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for tutorials on YouTube"""
        try:
            search_term = quote_plus(f"{skill} tutorial")
            url = f"https://www.youtube.com/results?search_query={search_term}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch YouTube results: Status {response.status}")
                        return []
                    
                    html = await response.text()
            
            # Extract video data from the page
            # YouTube uses a JavaScript-rendered page, so we need to extract data from the initial state
            initial_data_match = re.search(r'var ytInitialData = (.*?);</script>', html)
            
            tutorials = []
            
            if initial_data_match:
                try:
                    json_str = initial_data_match.group(1)
                    data = json.loads(json_str)
                    
                    contents = data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
                    
                    for content in contents:
                        item_section = content.get('itemSectionRenderer', {}).get('contents', [])
                        
                        for item in item_section:
                            video_renderer = item.get('videoRenderer', {})
                            if video_renderer:
                                try:
                                    video_id = video_renderer.get('videoId', '')
                                    title = video_renderer.get('title', {}).get('runs', [{}])[0].get('text', '')
                                    channel = video_renderer.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                                    view_count_text = video_renderer.get('viewCountText', {}).get('simpleText', '0 views')
                                    
                                    view_count = int(re.sub(r'[^\d]', '', view_count_text)) if re.sub(r'[^\d]', '', view_count_text) else 0
                                    
                                    if video_id and title:
                                        tutorials.append({
                                            'title': title,
                                            'url': f"https://www.youtube.com/watch?v={video_id}",
                                            'provider': channel,
                                            'views': view_count,
                                            'rating': view_count / 1000000,  # Normalize views as a form of rating
                                            'source': 'YouTube',
                                            'resource_type': 'video',
                                            'price_type': 'free',
                                            'skill': skill
                                        })
                                        
                                        if len(tutorials) >= max_results:
                                            break
                                except Exception as e:
                                    logger.error(f"Error parsing YouTube video: {str(e)}")
                            
                            if len(tutorials) >= max_results:
                                break
                        
                        if len(tutorials) >= max_results:
                            break
                except Exception as e:
                    logger.error(f"Error parsing YouTube data: {str(e)}")
            
            return tutorials
        except Exception as e:
            logger.error(f"Error searching YouTube: {str(e)}")
            return []
    
    async def find_resources_for_skill(self, skill: str) -> List[Dict[str, Any]]:
        """Find resources for a specific skill from multiple sources"""
        tasks = [
            self.search_udemy(skill),
            self.search_coursera(skill),
            self.search_github(skill),
            self.search_youtube(skill)
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Combine all results
        all_resources = []
        for resource_list in results:
            all_resources.extend(resource_list)
        
        # Sort by rating (if available)
        all_resources.sort(key=lambda x: x.get('rating', 0), reverse=True)
        
        return all_resources
    
    def save_resources_to_local(self, skill: str, resources: List[Dict[str, Any]]) -> None:
        """Save resources to a local JSON file per skill"""
        import os
        import json
        skill_file = os.path.join(self.data_folder, f"{skill.lower().replace(' ', '_')}.json")
        try:
            # Load existing resources if any
            if os.path.exists(skill_file):
                with open(skill_file, 'r') as f:
                    existing_resources = json.load(f)
            else:
                existing_resources = []
            # Merge and deduplicate by URL
            url_set = {r['url'] for r in existing_resources}
            for resource in resources:
                if resource['url'] not in url_set:
                    existing_resources.append(resource)
                    url_set.add(resource['url'])
            with open(skill_file, 'w') as f:
                json.dump(existing_resources, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving resources to local file: {str(e)}")
    
    async def find_and_save_resources(self, skills: List[str]) -> List[Dict[str, Any]]:
        """Find and save resources for multiple skills"""
        all_resources = []
        for skill in skills:
            resources = await self.find_resources_for_skill(skill)
            all_resources.extend(resources)
            self.save_resources_to_local(skill, resources)
        return all_resources

async def get_resources_for_skills(skills: List[str]) -> List[Dict[str, Any]]:
    """Helper function to get resources for a list of skills"""
    scraper = ResourceScraper()
    return await scraper.find_and_save_resources(skills) 