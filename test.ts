import { getAssignmentRows } from './Notion/assignmentDB'
import { getNotionClient } from './Notion/Queries'

const isNewAssignment = async (notionClient, assignmentID) => {

  const matchingCanvasIDFilter = {
    property: "canvasID",
    rich_text:{ contains: assignmentID }
  }

  const matchingCanvasIDAssignments = await getAssignmentRows(notionClient, matchingCanvasIDFilter)
  console.log(matchingCanvasIDAssignments)
  return matchingCanvasIDAssignments.length === 0
};

(async () => {
  const notion = await getNotionClient();
  const isNewAssignmentTest = await isNewAssignment(notion, "85970000002735932")
  console.log(isNewAssignmentTest)
})()