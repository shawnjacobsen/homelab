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
    console.log(newAssignments.length, newAssignments[0]);
    // add new assignments to notion
    newAssignments.forEach(assignment => {
        // create assignment properties
        const properties = Assignment.createAssignmentProperties();
        // add page to assignments DB
        Assignment.addNewAssignmentRow(notionClient, properties);
    });
}))();
