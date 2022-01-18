import { logError } from '../helpers'
import { getDatabase, createNewPage } from './Queries'
import * as assignmentProperties from './assignmentProperties.json'
import { AssignmentPropsType, AssignmentPropsSubsetType } from './Types'

const NOTION_DB_ASSIGNMENTS = process.env.NOTION_DB_ASSIGNMENTS

const DEFAULT_ASSIGNMENT_PROPS:AssignmentPropsType = {
  category:null,
  _class:null,
  assignmentName:"New Assignment",
  progress:"Incomplete",
  dueDate:null,
  assignmentType:"Book Quiz",
  submission:null,
  quickNotes:"",
  canvasID:null,
  semester:"",
  DoToday:false
}

export const createAssignmentProperties = (
  overriddenProperties:AssignmentPropsSubsetType
  ):any => {

    // default property values of an assignment overridden with parameter properties
    const assignmentCustomProperties:AssignmentPropsType = {...DEFAULT_ASSIGNMENT_PROPS, ...overriddenProperties}

    // supplied structure for assignment query
    const properties = assignmentProperties

    properties.Submission.url =                             assignmentCustomProperties.submission
    properties.Class.select.name =                          assignmentCustomProperties._class
    properties["Due Date"].date.start =                     assignmentCustomProperties.dueDate
    properties.Type.select.name =                           assignmentCustomProperties.assignmentType

    if (assignmentCustomProperties.canvasID === null) {
      properties.canvasID.rich_text = []
    } else {
      properties.canvasID.rich_text[0].text.content =       assignmentCustomProperties.canvasID
      properties.canvasID.rich_text[0].plain_text =         assignmentCustomProperties.canvasID
    }

    if (assignmentCustomProperties.progress === null) {
      properties.Progress.select = null
    } else {
      properties.Progress.select.name =                     assignmentCustomProperties.progress
    }

    if (assignmentCustomProperties.quickNotes === null) {
      properties["Quick Notes"].rich_text = []
    } else {
      properties["Quick Notes"].rich_text[0].text.content =   assignmentCustomProperties.quickNotes
      properties["Quick Notes"].rich_text[0].plain_text =     assignmentCustomProperties.quickNotes
    }

    if (assignmentCustomProperties.category === null) {
      properties.Category.select = null
    } else {
      properties.Category.select.name =                       assignmentCustomProperties.category
    }

    properties.Assignment.title[0].text.content =           assignmentCustomProperties.assignmentName
    properties.Assignment.title[0].plain_text =             assignmentCustomProperties.assignmentName

    return properties
  }

export const getAssignmentRows = async (notionClient, filters:any={}):Promise<Array<any>> => {
  return await getDatabase(notionClient, NOTION_DB_ASSIGNMENTS,filters)
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

export const addNewAssignmentRow = async (notionClient:any, properties:any) => {
  await createNewPage(notionClient, NOTION_DB_ASSIGNMENTS, properties)
}