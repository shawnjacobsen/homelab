import { logError } from '../helpers'
import { getDatabase } from './Queries'
import * as assignmentProperties from './assignmentProperties.json'

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

export const createAssignmentProperties = (
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
  ):any => {

    const properties = assignmentProperties

    properties.Submission.url = submission
    properties.Class.select.name = _class
    properties["Due Date"].date.start = dueDate
    properties.Type.select.name = assignmentType
    properties.canvasID.rich_text[0].text.content = canvasID
    properties.canvasID.rich_text[0].plain_text = canvasID
    properties.Progress.select.name = progress
    properties["Quick Notes"].rich_text[0].text.content = quickNotes
    properties["Quick Notes"].rich_text[0].plain_text = quickNotes
    properties.Category.select.name = category
    properties.Assignment.title[0].text.content = assignmentName
    properties.Assignment.title[0].plain_text = assignmentName

    return properties
  }

export const getAssignmentRows = async (notionClient, filters:any={}):Promise<Array<any>> => {
  return await getDatabase(notionClient, process.env.NOTION_DB_ASSIGNMENTS,filters)
}

export const isNewAssignment = async (notionClient, assignmentID:string):Promise<boolean> => {

  const matchingCanvasIDFilter = {
    property: "canvasID",
    text:{ equals: assignmentID.toString() }
  }

  console.log(matchingCanvasIDFilter)

  const matchingCanvasIDAssignments = await getAssignmentRows(notionClient, matchingCanvasIDFilter)
  return matchingCanvasIDAssignments.length === 0
}