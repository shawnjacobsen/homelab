# defines queries to interest with the Notion API

import requests, json, os
from dotenv import load_dotenv
load_dotenv()

# Default HTTP headers
HEADERS = {
  "Authorization": "Bearer " + os.getenv('NOTION_SECRET'),
  "Content-Type": "application/json",
  "Notion-Version": "2021-05-13"
}

# reads specified database, returning json data from request
def readDatabase(databaseId, headers=HEADERS):
    readUrl = f"https://api.notion.com/v1/databases/{databaseId}/query"

    res = requests.request("POST", readUrl, headers=headers)
    data = res.json()

    return data

def addPageToDatabse(databaseId, pageProperties):
  pass

readDatabase(os.getenv("NOTION_DB_TEST"))