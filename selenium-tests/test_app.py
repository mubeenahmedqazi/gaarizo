"""Selenium smoke test for Gaarizo.

Usage: python test_app.py [base_url] [--headed]
  base_url: or set APP_URL; default http://localhost
  --headed: show Chrome and pause 1.5s between checks (default is headless)
"""
import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

HEADED = "--headed" in sys.argv[1:]
_args = [a for a in sys.argv[1:] if not a.startswith("--")]
BASE_URL = (_args[0] if _args else os.environ.get("APP_URL", "http://localhost")).rstrip("/")
PAUSE = 1.5 if HEADED else 0
SHOT_DIR = os.path.dirname(os.path.abspath(__file__))
results = []


def report(name, ok, detail=""):
    results.append(ok)
    print(f"{'PASS' if ok else 'FAIL'} - {name}" + (f" ({detail})" if detail else ""))
    time.sleep(PAUSE)  # only pauses in --headed mode, so the run can be watched


def make_driver():
    opts = Options()
    if not HEADED:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1366,900")
    return webdriver.Chrome(options=opts)  # Selenium Manager fetches the driver


def main():
    print(f"Testing {BASE_URL}")
    driver = make_driver()
    wait = WebDriverWait(driver, 15)
    try:
        # a) home page title
        driver.get(BASE_URL + "/")
        try:
            wait.until(lambda d: d.title.strip() != "")
            report("Home page title is not empty", True, driver.title)
        except Exception as e:
            report("Home page title is not empty", False, type(e).__name__)

        # b) site title
        try:
            el = wait.until(EC.visibility_of_element_located((By.ID, "site-title")))
            report("#site-title contains 'Gaarizo'", "Gaarizo" in el.text, el.text)
        except Exception as e:
            report("#site-title contains 'Gaarizo'", False, type(e).__name__)

        # e) served-by (footer is fetched client-side, so wait for the hostname)
        try:
            el = wait.until(EC.visibility_of_element_located((By.ID, "served-by")))
            wait.until(lambda d: d.find_element(By.ID, "served-by").text.strip() not in ("", "..."))
            text = driver.find_element(By.ID, "served-by").text
            report("#served-by is visible", True, f"Served by: {text}")
        except Exception as e:
            report("#served-by is visible", False, type(e).__name__)
        driver.save_screenshot(os.path.join(SHOT_DIR, "home.png"))

        # c) cars list
        driver.get(BASE_URL + "/cars")
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#car-list .car-card")))
            count = len(driver.find_elements(By.CSS_SELECTOR, "#car-list .car-card"))
            report("/cars shows at least 1 .car-card", count >= 1, f"{count} cards")
        except Exception as e:
            report("/cars shows at least 1 .car-card", False, type(e).__name__)
        driver.save_screenshot(os.path.join(SHOT_DIR, "cars.png"))

        # d) detail page shows a price
        try:
            link = driver.find_element(By.CSS_SELECTOR, "#car-list .car-card a")
            link.click()
            wait.until(EC.url_contains("/cars/"))
            wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "main"), "Rs"))
            price = driver.find_element(By.CSS_SELECTOR, "main p.text-4xl").text
            report("Detail page shows price containing 'Rs'", "Rs" in price, price)
        except Exception as e:
            report("Detail page shows price containing 'Rs'", False, type(e).__name__)
    finally:
        driver.quit()

    passed = sum(results)
    print(f"\nSummary: {passed}/{len(results)} checks passed")
    sys.exit(0 if results and all(results) else 1)


if __name__ == "__main__":
    main()
