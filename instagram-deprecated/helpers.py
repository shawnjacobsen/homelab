# Instagram helper functions
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from helpers import sleepRand
from instagram.pages import is404Page


def loginToInstagram(dvr:WebDriver, username:str, password:str)-> (bool, str):
  """ login to instagram
  Args:
      dvr (WebDriver): Selenium webdriver object
      implicit_wait (int): max time to wait on next element to load
  Returns:
      (bool, str): (did login?, "success" || <error message>)
  """
  res = (True, "success")
  loginURL = "https://www.instagram.com/accounts/login/"
  homeURL = "https://www.instagram.com/"
  dvr.get(loginURL)
  isLoginPage = dvr.current_url == loginURL
  isHomePage = dvr.current_url == homeURL
  try:
    if is404Page(dvr):
      res = (False, "redirected to 404 page")
    elif isLoginPage:
      sleepRand(5,1,True)
      # login page elements
      username_input = dvr.find_element(By.NAME,"username")
      password_input = dvr.find_element(By.NAME,"password")
      login_btn = dvr.find_element(By.CSS_SELECTOR, "#loginForm > div > div:nth-child(3) > button")

      # fill and submit login form
      username_input.send_keys(username)
      password_input.send_keys(password)
      sleepRand(2,1,True)
      login_btn.click()
      
      # approve one tap to stay logged in if prompted
      sleepRand(5,3,True)
      print(dvr.current_url)
      isOneTapPrompt = dvr.current_url == "https://www.instagram.com/accounts/onetap/"
      if isOneTapPrompt:
        save_info_btn = dvr.find_element(By.CSS_SELECTOR, "#mount_0_0_lo section > main > div > div > div > section > div > button")
        save_info_btn.click()
    elif isHomePage:
      print("already logged in")
    else:
      res = (False, f"redirected to {dvr.current_url}")
  except:
    res = (False, f"selenium exception was thrown at URL {dvr.current_url}")
  return res