# creates daily tasks specified in recurringTasks.json in the Notion "Assignments" DB
from dotenv import load_dotenv
from datetime import datetime
import json, os

from Notion.queries import addPageToDatabase
from helpers import dayOfTheWeek
load_dotenv()

# import tasks
f = open('Notion/recurringTasks.json')
tasks = json.load(f)['tasks']


for task in tasks:
  dotw = dayOfTheWeek()
  if (dotw in task['days of the week']):
    print("adding task to assignments DB")
    # addPageToDatabase(os.getenv("NOTION_DB_ASSIGNMENTS"))