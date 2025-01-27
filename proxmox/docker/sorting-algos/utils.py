import time

def time_function(func, *args, **kwargs):
  start_time = time.time()
  result = func(*args, **kwargs)
  end_time = time.time()
  exec_time = end_time - start_time

  return result, exec_time