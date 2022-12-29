import pathlib

# returns the root directory of the python script
def scriptDirectory():
  return pathlib.Path().absolute()