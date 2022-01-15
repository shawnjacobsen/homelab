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
exports.isNewAssignment = exports.getAssignmentRows = exports.createAssignmentProperties = void 0;
const Queries_1 = require("./Queries");
const assignmentProperties = __importStar(require("./assignmentProperties.json"));
const createAssignmentProperties = (category = "", _class = "", assignmentName = "", progress = "Incomplete", dueDate = "", assignmentType = "Book Quiz", submission = "", quickNotes = "", canvasID = "", semester = "", DoToday = false) => {
    const properties = assignmentProperties;
    properties.Submission.url = submission;
    properties.Class.select.name = _class;
    properties["Due Date"].date.start = dueDate;
    properties.Type.select.name = assignmentType;
    properties.canvasID.rich_text[0].text.content = canvasID;
    properties.canvasID.rich_text[0].plain_text = canvasID;
    properties.Progress.select.name = progress;
    properties["Quick Notes"].rich_text[0].text.content = quickNotes;
    properties["Quick Notes"].rich_text[0].plain_text = quickNotes;
    properties.Category.select.name = category;
    properties.Assignment.title[0].text.content = assignmentName;
    properties.Assignment.title[0].plain_text = assignmentName;
    return properties;
};
exports.createAssignmentProperties = createAssignmentProperties;
const getAssignmentRows = (notionClient, filters = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, Queries_1.getDatabase)(notionClient, process.env.NOTION_DB_ASSIGNMENTS, filters);
});
exports.getAssignmentRows = getAssignmentRows;
const isNewAssignment = (notionClient, assignmentID) => __awaiter(void 0, void 0, void 0, function* () {
    const matchingCanvasIDFilter = {
        property: "canvasID",
        text: { equals: assignmentID.toString() }
    };
    console.log(matchingCanvasIDFilter);
    const matchingCanvasIDAssignments = yield (0, exports.getAssignmentRows)(notionClient, matchingCanvasIDFilter);
    return matchingCanvasIDAssignments.length === 0;
});
exports.isNewAssignment = isNewAssignment;
