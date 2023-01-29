# defines queries to interest with the Notion API

import requests, json, os
from dotenv import load_dotenv
load_dotenv()

# Default HTTP headers
HEADERS = {
  "Authorization": "Bearer " + os.getenv('NOTION_SECRET'),
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28"
}

# returns pages in databse based on provided filter, returning json
def getPages(databaseId, filter={}, headers=HEADERS):
  endpoint = f"https://api.notion.com/v1/databases/{databaseId}/query"
  data = {}
  if (bool(filter)):
    data["filter"] = filter

  res = requests.request("POST", endpoint, headers=headers, json=data)
  data = res.json()

  return data

# returns response after adding a new page to the specified database
def addPageToDatabase(databaseId, pageProperties, headers=HEADERS):
  endpoint = f"https://api.notion.com/v1/pages"
  data = {
    "parent": { "type": "database_id", "database_id": databaseId },
    "properties": pageProperties
  }

  res = requests.request("POST", endpoint, headers=headers, json=data)
  data = res.json()

  return data


filter = {
  "property": "due",
  "date": {
    "past_week": {}
  }
}
newPageProperties = {
	"due": { "type": "date", "date": { "start": "2023-02-01" } },
	"Tags": { "type": "multi_select", "multi_select": [{ "name": "a" }, { "name": "b" }] },
	"Column": {
		"type": "rich_text",
		"rich_text": [
			{
				"type": "text",
				"text": { "content": "cccccc" },
				"annotations": {
					"bold": True,
					"italic": False,
					"strikethrough": False,
					"underline": False,
					"code": False,
					"color": "default"
				},
				"plain_text": "cccccc"
			}
		]
	},
	"Name": {
		"type": "title",
		"title": [
			{
				"type": "text",
				"text": { "content": "GENERATED ITEM" },
				"annotations": {
					"bold": False,
					"italic": False,
					"strikethrough": False,
					"underline": False,
					"code": False,
					"color": "default"
				},
				"plain_text": "GENERATED ITEM"
			}
		]
	}
}

print("Getting pages from DB:")
print(json.dumps(getPages(os.getenv("NOTION_DB_TEST"), filter)))
print("\nAdding page to DB:")
print(json.dumps(addPageToDatabase(os.getenv("NOTION_DB_TEST"),newPageProperties)))