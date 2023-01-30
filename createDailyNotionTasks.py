# creates daily tasks specified in recurringTasks.json in the Notion "Assignments" DB
from dotenv import load_dotenv
from datetime import datetime
import json, os
load_dotenv()

from Notion.queries import addPageToDatabase
from helpers import dayOfTheWeek, datetimeInISO

# import tasks
f = open('Notion/recurringTasks.json')
tasks = json.load(f)['tasks']


for task in tasks:
  dotw = dayOfTheWeek()[0]
  if (dotw in task['days of the week']):
    print("adding task to assignments DB")

    # get today's date in ISO format at the tasks's specified time
    hh, mm, ss, offset = task['time']
    taskDueDate = datetimeInISO(hh, mm, ss, offset)
    
    # add this date as the 'Due Date' notion property
    task['properties']['Due Date']['date']['start'] = taskDueDate
    
    # add the task to the database
    print(addPageToDatabase(os.getenv("NOTION_DB_ASSIGNMENTS"), task['properties']))