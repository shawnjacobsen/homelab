# unfollow bot for Instagram
from time import sleep
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys

# Chrome driver location
CHROME_DRIVER_LOC:str = "../chromedriver.exe"

dvr = webdriver.Chrome(CHROME_DRIVER_LOC)

dvr.get("https://www.google.com")

input_field = dvr.find_element("xpath","/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/input")
input_field.send_keys("hello world")
dvr.send_keys(Keys.ENTER)