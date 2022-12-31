# unfollow bot for Instagram
from dotenv import dotenv_values
from time import sleep
from random import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from helpers import scriptDirectory
from instagram.helpers import loginToInstagram
from instagram.pages import is404Page

### SETUP
CHROME_DRIVER_LOC = f"{scriptDirectory()}/chromedriver.exe"
CHROME_COOKIE_LOC = f"{scriptDirectory()}/selenium"
IMPLICIT_WAIT_TIMEOUT = 20
env = dotenv_values()
USERNAME = env['INSTA_MANIAC_USR']
PASSWORD = env['INSTA_MANIAC_PSW']
### -----

# Chrome driver v108.0.5359.71
chrome_options = Options()
chrome_options.add_argument(f"user-data-dir={CHROME_COOKIE_LOC}") 
chrome_options.add_argument(f"executable_path={CHROME_DRIVER_LOC}")
chrome_options.add_experimental_option("detach",True) # don't auto quit when script is finished
chrome_options.add_experimental_option('excludeSwitches', ['enable-logging']) # prevent USB Error
dvr = webdriver.Chrome(options=chrome_options)
dvr.implicitly_wait(IMPLICIT_WAIT_TIMEOUT)

# login
didLogin, res_message = loginToInstagram(dvr)
if not didLogin:
  print(f"ERROR: could not login to instagram. {res_message}")
  print("Stopping process")
  ### should send message to client via smtp server, too
  exit()

# navigate to profile page, open followings modal
dvr.get(f"{homeURL}{USERNAME}/")
following_selector = "#mount_0_0_vo section > main > div > header > section > ul > li:nth-child(3) > a"
following_btn = dvr.find_element(By.CSS_SELECTOR, following_selector)
following_btn.click()



print("beginning endinig sleep")
print("done.")