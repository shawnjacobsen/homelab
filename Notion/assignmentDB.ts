import { productionLog } from '../helpers'
import { getDatabase, createNewPage } from './Queries'
import assignmentProperties from './assignmentProperties.json'
import { AssignmentPropsType, AssignmentPropsSubsetType } from './Types'

const NOTION_DB_ASSIGNMENTS = process.env.NOTION_DB_ASSIGNMENTS

const DEFAULT_ASSIGNMENT_PROPS:AssignmentPropsType = {
  category:null,
  _class:null,
  assignmentName:"New Assignment",
  progress:"Incomplete",
  dueDate:null,
  assignmentType:null,
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
    const properties = JSON.parse(JSON.stringify(assignmentProperties))
    console.log(properties["Due Date"].date !== null)

    properties.Submission.url =                               assignmentCustomProperties.submission
    properties.Class.select.name =                            assignmentCustomProperties._class
    
    if (assignmentCustomProperties.dueDate === null) {
      properties['Due Date'].date = null
    } else {
      properties["Due Date"].date.start =                     assignmentCustomProperties.dueDate
    }

    if (assignmentCustomProperties.assignmentType === null) {
      properties.Type.select = null
    } else {
      properties.Type.select.name =                           assignmentCustomProperties.assignmentType
    }
    if (assignmentCustomProperties.canvasID === null) {
      properties.canvasID.rich_text = []
    } else {
      properties.canvasID.rich_text[0].text.content =         assignmentCustomProperties.canvasID.toString()
      properties.canvasID.rich_text[0].plain_text =           assignmentCustomProperties.canvasID.toString()
    }

    if (assignmentCustomProperties.progress === null) {
      properties.Progress.select = null
    } else {
      properties.Progress.select.name =                       assignmentCustomProperties.progress
    }

    if (assignmentCustomProperties.quickNotes === null) {
      properties["Quick Notes"].rich_text = []
    } else {
      properties["Quick Notes"].rich_text[0].text.content =   assignmentCustomProperties.quickNotes.toString()
      properties["Quick Notes"].rich_text[0].plain_text =     assignmentCustomProperties.quickNotes.toString()
    }

    if (assignmentCustomProperties.category === null) {
      properties.Category.select = null
    } else {
      properties.Category.select.name =                       assignmentCustomProperties.category
    }

    properties.Assignment.title[0].text.content =             assignmentCustomProperties.assignmentName
    properties.Assignment.title[0].plain_text =               assignmentCustomProperties.assignmentName

    return properties
  }

export const getAssignmentRows = async (notionClient, filters:any={}):Promise<Array<any>> => {
  return await getDatabase(notionClient, NOTION_DB_ASSIGNMENTS,filters)
}

export const isNewAssignment = async (notionClient, assignmentID:string):Promise<boolean> => {

  const matchingCanvasIDFilter = {
    property: "canvasID",
    rich_text:{ contains: assignmentID }
  }

  const matchingCanvasIDAssignments = await getAssignmentRows(notionClient, matchingCanvasIDFilter)
  return matchingCanvasIDAssignments.length === 0
}

export const addNewAssignmentRow = async (notionClient:any, properties:any) => {
  await createNewPage(notionClient, NOTION_DB_ASSIGNMENTS, properties)
}