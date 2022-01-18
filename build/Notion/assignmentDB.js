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
exports.addNewAssignmentRow = exports.isNewAssignment = exports.getAssignmentRows = exports.createAssignmentProperties = void 0;
const Queries_1 = require("./Queries");
const assignmentProperties = __importStar(require("./assignmentProperties.json"));
const NOTION_DB_ASSIGNMENTS = process.env.NOTION_DB_ASSIGNMENTS;
const DEFAULT_ASSIGNMENT_PROPS = {
    category: "",
    _class: null,
    assignmentName: "",
    progress: "Incomplete",
    dueDate: null,
    assignmentType: "Book Quiz",
    submission: "",
    quickNotes: "",
    canvasID: "",
    semester: "",
    DoToday: false
};
const createAssignmentProperties = (overriddenProperties = {}) => {
    // default property values of an assignment overridden with parameter properties
    const assignmentcustomProperties = Object.assign(Object.assign({}, DEFAULT_ASSIGNMENT_PROPS), overriddenProperties);
    // supplied structure for assignment query
    const properties = assignmentProperties;
    properties.Submission.url = assignmentcustomProperties.submission == "" ? null : assignmentcustomProperties.submission;
    properties.Class.select.name = assignmentcustomProperties._class;
    properties["Due Date"].date.start = assignmentcustomProperties.dueDate;
    properties.Type.select.name = assignmentcustomProperties.assignmentType;
    properties.canvasID.rich_text[0].text.content = assignmentcustomProperties.canvasID;
    properties.canvasID.rich_text[0].plain_text = assignmentcustomProperties.canvasID;
    properties.Progress.select.name = assignmentcustomProperties.progress;
    properties["Quick Notes"].rich_text[0].text.content = assignmentcustomProperties.quickNotes;
    properties["Quick Notes"].rich_text[0].plain_text = assignmentcustomProperties.quickNotes;
    properties.Category.select.name = assignmentcustomProperties.category;
    properties.Assignment.title[0].text.content = assignmentcustomProperties.assignmentName;
    properties.Assignment.title[0].plain_text = assignmentcustomProperties.assignmentName;
    return properties;
};
exports.createAssignmentProperties = createAssignmentProperties;
const getAssignmentRows = (notionClient, filters = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, Queries_1.getDatabase)(notionClient, NOTION_DB_ASSIGNMENTS, filters);
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
const addNewAssignmentRow = (notionClient, properties) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, Queries_1.createNewPage)(notionClient, NOTION_DB_ASSIGNMENTS, properties);
});
exports.addNewAssignmentRow = addNewAssignmentRow;
