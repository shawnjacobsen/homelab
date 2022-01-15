// Notion Imports
import * as Assignment from './Notion/assignmentDB'
import * as NotionQueries from './Notion/Queries'
import * as AssignmentProperties from './Notion/assignmentProperties.json'

// Canvas Imports
import * as Courses from './Canvas/Courses'
import * as CanvasQueries from './Canvas/Queries'


// async script
(async () => {
  // init notion client
  const notionClient = NotionQueries.getNotionClient()

  // get canvas assignments
  const aggregateAssignmentData = await Courses.getCurrentSemesterAssignements();

  // flatten assignments (remove course layer)
  const flattenedCanvasAssignments = []
  aggregateAssignmentData.forEach(course => 
    course.forEach(assignment => flattenedCanvasAssignments.push(assignment))
  );

  // filter down to only assignments not in Notion DB
  const unresolvedNewAssignments = flattenedCanvasAssignments.filter(
    assignment => Assignment.isNewAssignment(notionClient, assignment.id)
  );
  const newAssignments = await Promise.all(unresolvedNewAssignments)

  console.log(newAssignments.length, newAssignments[0])
  
  // add new assignments to notion
  newAssignments.forEach(assignment => {
    // create assignment properties
    const properties = Assignment.createAssignmentProperties()

    // add page to assignments DB
  })
  
})()