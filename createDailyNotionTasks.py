# creates daily tasks specified in recurringTasks.json in the Notion "Assignments" DB
from dotenv import load_dotenv
import json, os
load_dotenv()

# change working directory to this file's directory so relative imports work
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)
print(f"new working directory: {dname}")
from Notion.queries import addPageToDatabase
from helpers import dayOfTheWeek, datetimeInISO
from notifications import sendText

# import tasks
f = open('Notion/recurringTasks.json')
tasks = json.load(f)['tasks']


for task in tasks:
  dotw = dayOfTheWeek()[0]
  if (dotw in task['days of the week']):

    # get today's date in ISO format at the tasks's specified time
    hh, mm, ss, offset = task['time']
    taskDueDate = datetimeInISO(hh, mm, ss, offset)
    
    # add this date as the 'Due Date' notion property
    task['properties']['Due Date']['date']['start'] = taskDueDate
    
    # add the task to the database
    status, data = addPageToDatabase(os.getenv("NOTION_DB_ASSIGNMENTS"), task['properties'])

    if status != 200:
      sendText(
        "6143701557",
        "Recurring Notion Task Error",
        f"Could not add task: {task['properties']['Assignment']['title'][0]['text']['content']}"
      )
