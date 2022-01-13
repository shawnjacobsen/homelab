require('dotenv').config()
import axios from 'axios'

// class data
import * as CLASS_DATA from './OhioStateClasses.json'

const CLASS_ID_INDICATOR = "<class_id>"
const SEMESTER_ID_INDICATOR = "<semester_id>"

// endpoint to access all active class information
const CLASS_INFO_URL =
  `https://canvas.instructure.com/api/v1/courses?per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`

// endpoint to access specific class information
// replace CLASS_ID_INDICATOR for use
const CLASS_COURSE_BY_ID_URL =
  `https://canvas.instructure.com/api/v1/courses/${CLASS_ID_INDICATOR}/assignments?per_page=100&include=submission&access_token=${process.env.CARMEN_ACCESS_TOKEN}`



export const getCurrentSemesterClasses = async () => {
  const currentSemesterID = CLASS_DATA.class_Data.find(obj => obj.semester === process.env.SEMESTER).enrollment_term_id
  return await getClassesBySemesterID(currentSemesterID)
}

export const getClassesBySemesterID = async (semesterID) => {
  const currentClassData = CLASS_DATA.class_Data.find(obj => obj.semester === process.env.SEMESTER).classes
  
  // get the canvas data for all classes in currentClassData
  return currentClassData.map(async (_class) => {

    // get class data
    const canvasClassData = await axios.get(CLASS_COURSE_BY_ID_URL.replace(CLASS_ID_INDICATOR, _class.id))
    console.dir(canvasClassData,{depth:null})

    // filter class data to useable fields
    
  
  })
  

}