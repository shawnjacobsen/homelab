import pathlib
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