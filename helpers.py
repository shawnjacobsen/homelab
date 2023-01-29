import pathlib
from datetime import datetime
from time import sleep
from random import gauss

# returns the root directory of the python script
def scriptDirectory():
  return pathlib.Path().absolute()


def sleepRand(t:float, sigma:float,debug=False) -> None:
  time_to_wait = gauss(t, sigma)
  if time_to_wait <= 0:
    time_to_wait = t
  if (debug):
    print("beginning random wait time -----")
  sleep(time_to_wait)
  if (debug):
    print(f"ending random wait time ({time_to_wait} seconds)")

# return the current day of the week as both a string and index
def dayOfTheWeek():
  day_of_week = datetime.today().weekday()
  weekday_name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][day_of_week]
  return (day_of_week, weekday_name)