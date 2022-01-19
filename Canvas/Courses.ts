import { CANVAS_BASE_URL, getAssignmentsByCourseID } from './Queries'

// environment
const CURRENT_SEMESTER = process.env.SEMESTER

// course data
import OhioStateCourses from './OhioStateCourses.json'
const COURSE_DATA = OhioStateCourses.course_data
const SEMESTER_DATA = OhioStateCourses.semester_data

// fields to keep when getting assignments
const usefulAssignmentFields = [
  "id",
  "description",
  "due_at",
  "name",
  "has_submitted_submissions",
  "course_id"
]

export const getCurrentSemesterAssignements = async ():Promise<Array<Array<any>>> => {
  const currentSemesterID = SEMESTER_DATA[CURRENT_SEMESTER]
  const aggregateAssignments = await getAssignementsBySemesterID(currentSemesterID)
  return aggregateAssignments
}

export const getAssignementsBySemesterID = async (semesterID):Promise<Array<any>> => {
  const currentCourseData = COURSE_DATA.filter(course => course.enrollment_term_id === semesterID)

  // get the canvas data for all courses in currentCourseData
  const unresolvedAggregateAssignments = currentCourseData.map(course => getAssignmentsByCourseID(course.id, usefulAssignmentFields))

  return await Promise.all(unresolvedAggregateAssignments)
}

// get specified course by courseID
export const getNotionCourseNameFromCourseID = (courseID:string):string => COURSE_DATA.find(course => course.id === courseID).notion_name;

// get Submission URL for an assignment
export const getCanvasSubmissionURL = (courseID:string, assignmentID:string):string => `${CANVAS_BASE_URL}/courses/${courseID}/assignments/${assignmentID}`;

// get the colloquial semester name (ie. SP22, AU35, etc) for some course
export const getNotionSemesterFromCourseID = (courseID:string):string => COURSE_DATA.find(course => course.id === courseID).semester;

// checks if canvasID exists in OhioStateCourses.json
export const isBeingTracked = (courseID:string):boolean => COURSE_DATA.some(course => course.id === courseID);