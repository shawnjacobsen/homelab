require('dotenv').config()
import axios from 'axios'

import { filterKeysOfObject } from '../helpers'

const COURSE_ID_INDICATOR = "<course_id>"

// endpoint to access all active course information
const COURSE_INFO_URL =
  `https://canvas.instructure.com/api/v1/courses?per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`

// endpoint to access specific course information
// replace COURSE_ID_INDICATOR when called
const COURSE_COURSE_BY_ID_URL =
  `https://canvas.instructure.com/api/v1/courses/${COURSE_ID_INDICATOR}/assignments?per_page=100&include=submission&access_token=${process.env.CARMEN_ACCESS_TOKEN}`


export const getAssignmentsByCourseID = async (courseID, allowedFields):Promise<Array<any>> => {
  const httpData = await axios.get(COURSE_COURSE_BY_ID_URL.replace(COURSE_ID_INDICATOR, courseID))

    // filter assignment data to useable fields
    const filteredAssignmentData = httpData.data.map(assignment => filterKeysOfObject(assignment, allowedFields))
  return filteredAssignmentData
}