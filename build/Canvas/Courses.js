"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignementsBySemesterID = exports.getCurrentSemesterAssignements = void 0;
const Queries_1 = require("./Queries");
// course data
const COURSE_DATA = __importStar(require("./OhioStateCourses.json"));
// fields to keep when getting assignments
const usefulAssignmentFields = ["id", "description", "due_at", "name", "has_submitted_submissions"];
const getCurrentSemesterAssignements = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentSemesterID = COURSE_DATA.course_data.find(obj => obj.semester === process.env.SEMESTER).enrollment_term_id;
    const aggregateAssignments = yield (0, exports.getAssignementsBySemesterID)(currentSemesterID);
    return aggregateAssignments;
});
exports.getCurrentSemesterAssignements = getCurrentSemesterAssignements;
const getAssignementsBySemesterID = (semesterID) => __awaiter(void 0, void 0, void 0, function* () {
    const currentCourseData = COURSE_DATA.course_data.find(obj => obj.semester === process.env.SEMESTER).courses;
    // get the canvas data for all courses in currentCourseData
    const unresolvedAggregateAssignments = currentCourseData.map(course => (0, Queries_1.getAssignmentsByCourseID)(course.id, usefulAssignmentFields));
    return yield Promise.all(unresolvedAggregateAssignments);
});
exports.getAssignementsBySemesterID = getAssignementsBySemesterID;
