const { Client } = require("@notionhq/client")
import { logError } from '../helpers'

export const getDatabase = async (notionClient:any, databaseID:string, filters:any={}):Promise<Array<any>> => {
  return (await notionClient.databases.query({
    database_id: databaseID,
    filter: filters
  }).catch(logError)).results;
}

export const createNewPage = (notionClient:any, parentID:string, properties:any) => {
  notionClient.pages.create({
    parent: { database_id: parentID },
    properties
  })
}

// Initializing a client
export const getNotionClient = () => {
  return new Client({
  auth: process.env.NOTION_SECRET,
});
}