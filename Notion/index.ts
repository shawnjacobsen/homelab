const { Client } = require("@notionhq/client")
require('dotenv').config()

import { addAssignment } from './assignmentDB'
import { logError, isProduction } from '../helpers'

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

export default async () => {
  const retrievedDatabase = await notion.databases.query({
    database_id: process.env.NOTION_DB_TEST,
  }).catch(logError);
  
  if (!isProduction()) {
    retrievedDatabase.results.forEach((row:any) => {
      console.dir(row.properties,{depth:null});
      console.log("-------------\n")
    })
  }

  const newPage = notion.pages.create({
    parent: { database_id: process.env.NOTION_DB_TEST },
    properties: {
      Name: {
        id: 'title',
        type: 'title',
        'title':[{
            type: 'text',
            text: { content: 'NEW ITEM', link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default'
            },
            plain_text: 'NEW ITEM',
            href: null 
        }]
      }
    }
  })
  const updatedDatabase = await notion.databases.update({
    database_id: process.env.NOTION_DB_TEST
  })
  console.log(updatedDatabase)
}