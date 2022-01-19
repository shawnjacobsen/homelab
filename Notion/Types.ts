export type ProgressType = 
    "Incomplete"
    | "In Progress"
    |"Complete";

export type AssignmentType =
    "Lab"
  | "Book Quiz"
  | "Book Homework"
  | "PDF Homework"
  | "Essay | Report"
  | "EXAM"
  | "";

export type CategoryType =
    "OSU"
  | "Workato"
  | "Storyline"
  | "Other"
  | "";

export type AssignmentPropsType = {
  category:CategoryType,
  _class:string,
  assignmentName:string,
  progress:ProgressType,
  dueDate:string,
  assignmentType:AssignmentType,
  submission:string,
  quickNotes:string,
  canvasID:string,
  semester:string,
  DoToday:boolean
}

export type AssignmentPropsSubsetType = {
  category?:CategoryType,
  _class?:string,
  assignmentName?:string,
  progress?:ProgressType,
  dueDate?:string,
  assignmentType?:AssignmentType,
  submission?:string,
  quickNotes?:string,
  canvasID?:string,
  semester?:string,
  DoToday?:boolean
}