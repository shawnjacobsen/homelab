from selenium.webdriver.common.by import By

def is404Page(driver):
  return len(driver.find_elements(By.LINK_TEXT,"Go back to Instagram.")) > 0