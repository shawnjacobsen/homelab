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
// Notion Imports
const Assignment = __importStar(require("./Notion/assignmentDB"));
const NotionQueries = __importStar(require("./Notion/Queries"));
// Canvas Imports
const Courses = __importStar(require("./Canvas/Courses"));
// production log
const helpers_1 = require("./helpers");
// async script
(() => __awaiter(void 0, void 0, void 0, function* () {
    // init notion client
    const notionClient = NotionQueries.getNotionClient();
    // get canvas assignments
    const aggregateAssignmentData = yield Courses.getCurrentSemesterAssignements();
    // flatten assignments (remove course layer)
    const flattenedCanvasAssignments = [];
    aggregateAssignmentData.forEach(course => course.forEach(assignment => flattenedCanvasAssignments.push(assignment)));
    // filter down to only assignments not in Notion DB
    const unresolvedNewAssignments = flattenedCanvasAssignments.filter(assignment => Assignment.isNewAssignment(notionClient, assignment.id));
    const newAssignments = yield Promise.all(unresolvedNewAssignments);
    (0, helpers_1.productionLog)("NEW ASSIGNMENT COUNT: " + newAssignments.length);
    newAssignments.forEach((assignment) => console.log(assignment.course_id));
    // add new assignments to notion
    let addedCount = 0;
    newAssignments.forEach(assignment => {
        if (!Courses.isBeingTracked(assignment.course_id)) {
            (0, helpers_1.productionLog)(`Course is not being tracked. Course ID ${assignment.course_id}`);
            return;
        }
        (0, helpers_1.productionLog)(`Adding assignment: ${assignment.id}`);
        // create assignment properties
        const properties = Assignment.createAssignmentProperties({
            category: "OSU",
            _class: Courses.getNotionCourseNameFromCourseID(assignment.course_id),
            assignmentName: assignment.name,
            progress: assignment.has_submitted_submissions ? "Complete" : "Incomplete",
            dueDate: assignment.due_at,
            submission: Courses.getCanvasSubmissionURL(assignment.course_id, assignment.id),
            canvasID: assignment.id,
            semester: Courses.getNotionSemesterFromCourseID(assignment.course_id)
        });
        // add page to assignments DB
        Assignment.addNewAssignmentRow(notionClient, properties);
        addedCount++;
    });
    (0, helpers_1.productionLog)(`Added ${addedCount} course assignments to Notion`);
}))();
