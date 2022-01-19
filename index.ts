// Notion Imports
import * as Assignment from './Notion/assignmentDB'
import * as NotionQueries from './Notion/Queries'
import AssignmentProperties from './Notion/assignmentProperties.json'

// Canvas Imports
import * as Courses from './Canvas/Courses'
import * as CanvasQueries from './Canvas/Queries'

// production log
import { productionLog } from './helpers'


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

  productionLog("NEW ASSIGNMENT COUNT: " + newAssignments.length)

  // add new assignments to notion
  let addedCount = 0;
  newAssignments.forEach(assignment => {
    if (!Courses.isBeingTracked(assignment.course_id)) {
      productionLog(`Course is not being tracked. Course ID ${assignment.course_id}`)
      return
    }

    productionLog(`Adding assignment: ${assignment.id}`)

    // create assignment properties
    const properties = Assignment.createAssignmentProperties({
      category:"OSU",
      _class: Courses.getNotionCourseNameFromCourseID(assignment.course_id),
      assignmentName: assignment.name,
      progress: assignment.has_submitted_submissions ? "Complete" : "Incomplete",
      dueDate: assignment.due_at,
      submission: Courses.getCanvasSubmissionURL(assignment.course_id, assignment.id),
      canvasID: assignment.id,
      semester: Courses.getNotionSemesterFromCourseID(assignment.course_id)
    })

    // add page to assignments DB
    Assignment.addNewAssignmentRow(notionClient, properties)
    addedCount++;
  })

  productionLog(`Added ${addedCount} course assignments to Notion`)
  
})()