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
  retrievedDatabase.results.forEach(row => console.log(row.properties.Name.title))

  const newPage = notion.pages.create({
    parent: { database_id: process.env.NOTION_DB_TEST },
    properties: {
      name: {
        id: 'title',
        type: 'title',
        'title':{
            type: 'text',
            text: { content: 'Item 2', link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: 'default'
            },
            plain_text: 'Item 2',
            href: null
          
        }
    }
    }
  })
  const updatedDatabase = await notion.databases.update({
    database_id: process.env.NOTION_DB_TEST
  })
  console.log(notion.databases.update)
  
})()