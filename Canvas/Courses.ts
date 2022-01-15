import { getAssignmentsByCourseID } from './Queries'

// course data
import * as COURSE_DATA from './OhioStateCourses.json'

// fields to keep when getting assignments
const usefulAssignmentFields = ["id","description","due_at","name","has_submitted_submissions"]

export const getCurrentSemesterAssignements = async ():Promise<Array<Array<any>>> => {
  const currentSemesterID = COURSE_DATA.course_data.find(obj => obj.semester === process.env.SEMESTER).enrollment_term_id
  const aggregateAssignments = await getAssignementsBySemesterID(currentSemesterID)
  return aggregateAssignments
}


export const getAssignementsBySemesterID = async (semesterID):Promise<Array<any>> => {
  const currentCourseData = COURSE_DATA.course_data.find(obj => obj.semester === process.env.SEMESTER).courses

  // get the canvas data for all courses in currentCourseData
  const unresolvedAggregateAssignments = currentCourseData.map(course => getAssignmentsByCourseID(course.id, usefulAssignmentFields))

  return await Promise.all(unresolvedAggregateAssignments)
}