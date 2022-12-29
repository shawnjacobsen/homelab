# unfollow bot for Instagram
from dotenv import load_dotenv
from time import sleep
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from helpers import scriptDirectory

### SETUP
CHROME_DRIVER_LOC = "../chromedriver.exe"
username="prod.maniac"
password=""

### ----------------------------------------

# Chrome driver
chrome_options = Options()
chrome_options.add_argument("user-data-dir=selenium") 
chrome_options.add_argument(f"executable_path={CHROME_DRIVER_LOC}")
dvr = webdriver.Chrome(chrome_options=chrome_options)

# login to instagram
dvr.get("https://www.instagram.com/login")
if dvr.find_element(By.LINK_TEXT,"Go back to Instagram."):
  print("already logged in")
elif dvr.find_element(By.NAME,"username"):
  print("at the login page")
else:
  print("reached unknown page")

# follower_btn = dvr.find_element("xpath","/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/input")
# input_field.send_keys("hello world")
# dvr.send_keys(Keys.ENTER)