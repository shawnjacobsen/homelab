import { updateNotionWithCanvasAssignnments } from './CanvasNotionAutomation'
import * as NotionQueries from './Notion/Queries'


(async () => {

  /** NOTION <> CANVAS --------------------------------------------*/

  const notionClient = NotionQueries.getNotionClient()
  updateNotionWithCanvasAssignnments(notionClient)

  /** INSTA BOT AUTOMATION ----------------------------------------*/

  
})()