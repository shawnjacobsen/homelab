from merge_sort import merge_sort
from utils import time_function

# get user input
arr = []

while True:
    next_input = input("Add number (or press Enter to finish): ")
    if next_input == "":
        break
    try:
        number = float(next_input)
        arr.append(number)
    except ValueError:
        print("Invalid input. Please enter a number.")

# print original list
print("original array: ", arr)

# sort list and time execution
result, exec_time = time_function(merge_sort, arr)

# print results
print(f"sorted array in {exec_time}")
print("sorted array:   ", result)