"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBeingTracked = exports.getNotionSemesterFromCourseID = exports.getCanvasSubmissionURL = exports.getNotionCourseNameFromCourseID = exports.getAssignementsBySemesterID = exports.getCurrentSemesterAssignements = void 0;
const Queries_1 = require("./Queries");
// environment
const CURRENT_SEMESTER = process.env.SEMESTER;
// course data
const OhioStateCourses_json_1 = __importDefault(require("./OhioStateCourses.json"));
const COURSE_DATA = OhioStateCourses_json_1.default.course_data;
const SEMESTER_DATA = OhioStateCourses_json_1.default.semester_data;
// fields to keep when getting assignments
const usefulAssignmentFields = [
    "id",
    "description",
    "due_at",
    "name",
    "has_submitted_submissions",
    "course_id"
];
const getCurrentSemesterAssignements = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentSemesterID = SEMESTER_DATA[CURRENT_SEMESTER];
    const aggregateAssignments = yield (0, exports.getAssignementsBySemesterID)(currentSemesterID);
    return aggregateAssignments;
});
exports.getCurrentSemesterAssignements = getCurrentSemesterAssignements;
const getAssignementsBySemesterID = (semesterID) => __awaiter(void 0, void 0, void 0, function* () {
    const currentCourseData = COURSE_DATA.filter(course => course.enrollment_term_id === semesterID);
    // get the canvas data for all courses in currentCourseData
    const unresolvedAggregateAssignments = currentCourseData.map(course => (0, Queries_1.getAssignmentsByCourseID)(course.id, usefulAssignmentFields));
    return yield Promise.all(unresolvedAggregateAssignments);
});
exports.getAssignementsBySemesterID = getAssignementsBySemesterID;
// get specified course by courseID
const getNotionCourseNameFromCourseID = (courseID) => COURSE_DATA.find(course => course.id === courseID).notion_name;
exports.getNotionCourseNameFromCourseID = getNotionCourseNameFromCourseID;
// get Submission URL for an assignment
const getCanvasSubmissionURL = (courseID, assignmentID) => `${Queries_1.CARMEN_BASE_URL}/courses/${courseID}/assignments/${assignmentID}`;
exports.getCanvasSubmissionURL = getCanvasSubmissionURL;
// get the colloquial semester name (ie. SP22, AU35, etc) for some course
const getNotionSemesterFromCourseID = (courseID) => COURSE_DATA.find(course => course.id === courseID).semester;
exports.getNotionSemesterFromCourseID = getNotionSemesterFromCourseID;
// checks if canvasID exists in OhioStateCourses.json
const isBeingTracked = (courseID) => COURSE_DATA.some(course => course.id === courseID);
exports.isBeingTracked = isBeingTracked;
