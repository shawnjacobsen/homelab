require('dotenv').config()
const { Client } = require("@notionhq/client")

console.log(process.env.NOTION_SECRET)

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

(async () => {
  const retrievedDatabase = await notion.databases.query({
    database_id: process.env.NOTION_DB_TEST,
  })
  retrievedDatabase.results.forEach(row => {
    console.dir(row.properties,{depth:null});
    console.log("-------------\n")
  })

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
  
})()

type ProgressType = 
    "Incomplete"
    | "In Progress"
    |"Complete";

type AssignmentType =
    "Lab"
  | "Book Quiz"
  | "Book Homework"
  | "PDF Homework"
  | "Essay | Report"
  | "EXAM";

export function addAssignment(
  category="",
  _class="",
  assignmentName="",
  progress:ProgressType="Incomplete",
  dueDate="",
  assignmentType:AssignmentType="Book Quiz",
  submission="",
  quickNotes="",
  canvasID="",
  semester="",
  DoToday=false
  ) {
    const updatedDatabase=123
  }