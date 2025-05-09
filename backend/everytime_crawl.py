from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import time
import csv
import os
import datetime
from dotenv import load_dotenv
import pandas as pd
import re

# .env 파일 로드
load_dotenv()

# Chrome 옵션 설정
chrome_options = Options()
# chrome_options.add_argument("--headless")  # 필요시 헤드리스 모드 활성화
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
# 에러 로그 줄이기
chrome_options.add_argument("--log-level=3")
chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

# WebDriver 설정
driver_path = './chromedriver.exe'  # 크롬드라이버 경로
service = Service(driver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)

# CSV 파일 경로
csv_path = 'everytime_marketplace.csv'

# 기존 URL 목록 가져오기
def get_existing_urls():
    if not os.path.exists(csv_path):
        return []
    
    try:
        df = pd.read_csv(csv_path)
        if 'URL' in df.columns:
            return df['URL'].tolist()
        return []
    except Exception as e:
        print(f"기존 URL 목록을 가져오는 중 오류: {e}")
        return []

# CSV 파일 생성 또는 열기
def create_or_open_csv():
    file_exists = os.path.exists(csv_path)
    
    if file_exists:
        # 파일이 존재하면 행 수 확인
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            row_count = sum(1 for row in reader) - 1  # 헤더 제외
        print(f"기존 CSV 파일을 열었습니다. 현재 {row_count}개의 데이터가 있습니다.")
    else:
        # 파일이 없으면 헤더만 작성
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["제목", "내용", "작성자", "created_at", "이미지", "URL"])
        print("새 CSV 파일을 생성했습니다.")

# 데이터를 CSV에 추가
def append_to_csv(data_list):
    with open(csv_path, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for data in data_list:
            writer.writerow([
                data["title"],
                data["content"],
                data["author"],
                data["created_at"],
                data["images"],
                data["url"]
            ])

# 날짜 텍스트를 ISO 형식 날짜 문자열로 변환
def convert_to_iso_date(date_text):
    try:
        current_year = datetime.datetime.now().year
        dt = None
        
        # "몇 분 전", "몇 시간 전" 등의 패턴 처리
        if "분 전" in date_text:
            minutes = int(re.search(r'(\d+)분 전', date_text).group(1))
            dt = datetime.datetime.now() - datetime.timedelta(minutes=minutes)
        elif "시간 전" in date_text:
            hours = int(re.search(r'(\d+)시간 전', date_text).group(1))
            dt = datetime.datetime.now() - datetime.timedelta(hours=hours)
        elif "어제" in date_text:
            time_part = re.search(r'어제 (\d+):(\d+)', date_text)
            if time_part:
                hour, minute = map(int, time_part.groups())
                yesterday = datetime.datetime.now() - datetime.timedelta(days=1)
                dt = datetime.datetime(yesterday.year, yesterday.month, yesterday.day, hour, minute)
            else:
                dt = datetime.datetime.now() - datetime.timedelta(days=1)
        
        # "YY/MM/DD HH:MM" 패턴 처리 (이전 년도)
        elif re.match(r'\d{2}/\d{2}/\d{2} \d{2}:\d{2}', date_text):
            year, month, day, hour, minute = map(int, re.findall(r'\d+', date_text))
            # 2000년대로 변환 (예: 24 -> 2024)
            year = 2000 + year
            dt = datetime.datetime(year, month, day, hour, minute)
            
        # "MM/DD HH:MM" 패턴 처리 (올해)
        elif re.match(r'\d{2}/\d{2} \d{2}:\d{2}', date_text):
            month, day, hour, minute = map(int, re.findall(r'\d+', date_text))
            dt = datetime.datetime(current_year, month, day, hour, minute)
        
        # ISO 형식으로 반환
        if dt:
            return dt.isoformat()
        
        # 기타 패턴은 원본 텍스트 반환
        return date_text
    except Exception as e:
        print(f"날짜 변환 중 오류: {e}")
        return date_text

# 로그인 함수
def login(username, password):
    try:
        # 로그인 페이지로 이동
        driver.get('https://account.everytime.kr/login')
        time.sleep(3)
        
        print("로그인 페이지 로드 완료")
        
        # 입력 필드 찾기 - 실제 속성값 사용
        try:
            # ID 입력
            id_input = driver.find_element(By.XPATH, "//input[@name='id']")
            id_input.clear()
            id_input.send_keys(username)
            print("아이디 입력 완료")
            
            # 비밀번호 입력
            pw_input = driver.find_element(By.XPATH, "//input[@name='password']")
            pw_input.clear()
            pw_input.send_keys(password)
            print("비밀번호 입력 완료")
            
            # 로그인 버튼 클릭
            submit_button = driver.find_element(By.XPATH, "//input[@type='submit']")
            submit_button.click()
            print("로그인 버튼 클릭 완료")
            
            # 로그인 처리를 위한 대기
            time.sleep(5)
            
            # 로그인 성공 확인
            if "login" not in driver.current_url:
                print("로그인 성공!")
                return True
            else:
                print("로그인 실패!")
                return False
        
        except Exception as e:
            print(f"요소를 찾는 중 오류: {e}")
            
            # 디버깅: 현재 HTML 출력
            print("현재 페이지 HTML 구조:")
            print(driver.page_source[:500])  # 처음 500자만 출력
            
            return False
            
    except Exception as e:
        print(f"로그인 과정 중 오류 발생: {e}")
        return False

# 장터게시판으로 이동
def go_to_marketplace():
    try:
        driver.get('https://everytime.kr/420883')
        time.sleep(3)
        print("장터게시판 접속 성공")
        return True
    except Exception as e:
        print(f"장터게시판 이동 중 오류: {e}")
        return False

# 현재 페이지의 게시글 목록 가져오기
def get_article_links():
    try:
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        # 게시글 링크 찾기 (여러 선택자 시도)
        articles = soup.select('article')
        if not articles:
            articles = soup.select('.article')
        if not articles:
            articles = soup.select('[class*="article"]')
        
        links = []
        for article in articles:
            a_tag = article.find('a')
            if a_tag and a_tag.get('href'):
                article_url = 'https://everytime.kr' + a_tag.get('href')
                links.append(article_url)
        
        print(f"발견된 게시글 수: {len(links)}")
        return links
    except Exception as e:
        print(f"게시글 링크 수집 중 오류: {e}")
        return []

# 게시글 내용 스크래핑
def scrape_article(url):
    try:
        driver.get(url)
        time.sleep(2)
        
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        # 데이터 추출 (여러 선택자 시도)
        title = None
        content = None
        author = None
        date = None
        images = []
        
        # 제목 추출
        for selector in ['h2.large', 'h2', '.title', '[class*="title"]']:
            title = soup.select_one(selector)
            if title:
                break
        
        # 내용 추출
        for selector in ['p.large', 'p', '.text', '[class*="text"]', '[class*="content"]']:
            content = soup.select_one(selector)
            if content:
                break
        
        # 작성자 추출 - h3에서만 추출 (time 제외)
        for selector in ['h3.large', 'h3', '.author', '[class*="author"]']:
            author = soup.select_one(selector)
            if author:
                break
        
        # 날짜 추출
        for selector in ['time.large', 'time', '.date', '[class*="date"]']:
            date = soup.select_one(selector)
            if date:
                break
        
        # 이미지 추출
        image_tags = soup.select('figure.attach img')
        for img in image_tags:
            if img.get('src'):
                image_url = img.get('src')
                images.append(image_url)
        
        # 데이터 정제
        title_text = title.get_text().strip() if title else "제목 없음"
        content_text = content.get_text().strip() if content else "내용 없음"
        author_text = author.get_text().strip() if author else "작성자 없음"
        date_text = date.get_text().strip() if date else "날짜 없음"
        created_at = convert_to_iso_date(date_text)
        image_urls = ', '.join(images) if images else "이미지 없음"
        
        print(f"스크래핑 완료: {title_text}")
        return {
            "title": title_text,
            "content": content_text,
            "author": author_text,
            "created_at": created_at,
            "images": image_urls,
            "url": url
        }
    except Exception as e:
        print(f"게시글 스크래핑 중 오류: {e}")
        return None

# 다음 페이지 이동
def go_to_next_page(page_num):
    try:
        next_url = f'https://everytime.kr/420883/p/{page_num}'
        driver.get(next_url)
        time.sleep(2)
        
        # 페이지 로드 확인
        if f"/420883/p/{page_num}" in driver.current_url or (page_num == 1 and "/420883" in driver.current_url):
            print(f"페이지 {page_num}로 이동 성공")
            return True
        else:
            print(f"페이지 {page_num}로 이동 실패")
            return False
    except Exception as e:
        print(f"페이지 이동 중 오류: {e}")
        return False

# 메인 함수
def main():
    try:
        # 환경 변수에서 자격 증명 가져오기
        username = os.getenv("EVERYTIME_USERNAME")
        password = os.getenv("EVERYTIME_PASSWORD")
        
        if not username or not password:
            print("환경 변수에서 자격 증명을 찾을 수 없습니다. .env 파일을 확인하세요.")
            return
        
        print(f"사용자명: {username[:2]}***")  # 보안을 위해 일부만 출력
        
        # 기존 URL 목록 가져오기
        existing_urls = get_existing_urls()
        print(f"기존 URL 수: {len(existing_urls)}")
        
        # CSV 파일 생성 또는 열기
        create_or_open_csv()
        
        # 로그인
        if not login(username, password):
            print("로그인에 실패했습니다. 프로그램을 종료합니다.")
            return
        
        # 장터게시판으로 이동
        if not go_to_marketplace():
            print("장터게시판 이동에 실패했습니다. 프로그램을 종료합니다.")
            return
        
        # 스크래핑할 페이지 수
        num_pages = 5  # 필요에 따라 조정
        new_articles_count = 0
        buffer_data = []  # 임시 저장용 버퍼
        
        for page in range(1, num_pages + 1):
            print(f"\n========== 페이지 {page} 스크래핑 중... ==========")
            
            # 현재 페이지의 게시글 링크 가져오기
            article_links = get_article_links()
            
            if not article_links:
                print(f"페이지 {page}에서 게시글을 찾을 수 없습니다.")
                break
            
            for idx, link in enumerate(article_links, 1):
                # 이미 처리된 URL인지 확인
                if link in existing_urls:
                    print(f"게시글 {idx}/{len(article_links)} - 이미 존재하는 URL: {link}")
                    continue
                
                print(f"게시글 {idx}/{len(article_links)} 처리 중...")
                
                # 게시글 스크래핑
                article_data = scrape_article(link)
                
                if article_data:
                    # 버퍼에 데이터 추가
                    buffer_data.append(article_data)
                    new_articles_count += 1
                
                # 일정 간격으로 저장
                if len(buffer_data) >= 5:
                    append_to_csv(buffer_data)
                    print(f"임시 저장 완료 (새로운 게시글 {len(buffer_data)}개)")
                    buffer_data = []  # 버퍼 비우기
            
            # 마지막 페이지가 아니면 다음 페이지로 이동
            if page < num_pages:
                if not go_to_next_page(page + 1):
                    print("더 이상 페이지가 없습니다.")
                    break
        
        # 남은 데이터 저장
        if buffer_data:
            append_to_csv(buffer_data)
        
        if new_articles_count > 0:
            print(f"\n스크래핑 완료. {new_articles_count}개의 새로운 게시글이 추가되었습니다.")
            print(f"데이터는 {csv_path} 파일에 저장되었습니다.")
        else:
            print("\n새로운 게시글이 없습니다.")
        
    except Exception as e:
        print(f"오류 발생: {e}")
    finally:
        # 브라우저 종료
        driver.quit()

if __name__ == "__main__":
    main()