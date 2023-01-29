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

from helpers import scriptDirectory, sleepRand
from instagram.helpers import loginToInstagram

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
didLogin, res_message = loginToInstagram(dvr,USERNAME,PASSWORD)
if not didLogin:
  print(f"ERROR: could not login to instagram. {res_message}")
  print("Stopping process...")
  #dvr.quit()
  ### should send message to client via smtp server, too
  exit()

# navigate to profile page, open followings modal
homeURL = "https://www.instagram.com/"
dvr.get(f"{homeURL}{USERNAME}/")
following_selector = "#mount_0_0_vo section > main > div > header > section > ul > li:nth-child(3) > a"
following_btn = dvr.find_element(By.CSS_SELECTOR, following_selector)
following_btn.click()
sleepRand(5,1)
following_item_selector = "#mount_0_0_Az > div > div > div > div:nth-child(4) > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div > div.x7r02ix.xf1ldfh.x131esax.xdajt7p.xxfnqb6.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe > div > div > div._aano > div:nth-child(1) > div > div"
all_following = dvr.find_elements(By.CSS_SELECTOR, following_item_selector)
print(all_following)


print("done.")