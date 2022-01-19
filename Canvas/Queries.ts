require('dotenv').config()
import axios from 'axios'

import { filterKeysOfObject, stringifySpecifiedKeyValue } from '../helpers'

const COURSE_ID_INDICATOR = "<course_id>"

// base URL
export const CANVAS_BASE_URL = 
  `https://canvas.instructure.com`

// CARMEN URL
export const CARMEN_BASE_URL = 
  `https://osu.instructure.com`

// endpoint to access all active course information
export const COURSE_INFO_URL =
  `${CANVAS_BASE_URL}/api/v1/courses?per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`

// endpoint to access specific course information
// replace COURSE_ID_INDICATOR when called
export const COURSE_BY_ID_URL =
  `${CANVAS_BASE_URL}/api/v1/courses/${COURSE_ID_INDICATOR}/assignments?per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`


export const getAssignmentsByCourseID = async (courseID, allowedFields):Promise<Array<any>> => {
  
  // get raw Canvas Data
  const response = await axios.get(COURSE_BY_ID_URL.replace(COURSE_ID_INDICATOR, courseID), {transformResponse: [data => data]})
  
  // convert id's values to strings so that are not truncated or malformed
  const httpData = stringifySpecifiedKeyValue(response.data,'id')

  // filter assignment data to useable fields
  const filteredAssignmentData = httpData.map(assignment => (filterKeysOfObject(assignment, allowedFields)))
  
  // adapt proper canvas course key to assignments
  filteredAssignmentData.forEach(assignment => assignment.course_id = courseID)

  return filteredAssignmentData
}