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

export function addAssignment(
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
  ) {
    const updatedDatabase=123
  }