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
exports.addNewAssignmentRow = exports.isNewAssignment = exports.getAssignmentRows = exports.createAssignmentProperties = void 0;
const Queries_1 = require("./Queries");
const assignmentProperties_json_1 = __importDefault(require("./assignmentProperties.json"));
const NOTION_DB_ASSIGNMENTS = process.env.NOTION_DB_ASSIGNMENTS;
const DEFAULT_ASSIGNMENT_PROPS = {
    category: "",
    _class: null,
    assignmentName: "New Assignment",
    progress: "Incomplete",
    dueDate: null,
    assignmentType: "",
    submission: null,
    quickNotes: "",
    canvasID: null,
    semester: "",
    DoToday: false
};
const createAssignmentProperties = (overriddenProperties) => {
    // default property values of an assignment overridden with parameter properties
    const assignmentCustomProperties = Object.assign(Object.assign({}, DEFAULT_ASSIGNMENT_PROPS), overriddenProperties);
    // supplied structure for assignment query
    const properties = assignmentProperties_json_1.default;
    properties.Submission.url = assignmentCustomProperties.submission;
    properties.Class.select.name = assignmentCustomProperties._class;
    properties["Due Date"].date.start = assignmentCustomProperties.dueDate;
    if (assignmentCustomProperties.assignmentType === "") {
        properties.Type.select = null;
    }
    else {
        properties.Type.select.name = assignmentCustomProperties.assignmentType;
    }
    if (assignmentCustomProperties.canvasID === null) {
        properties.canvasID.rich_text = [];
    }
    else {
        properties.canvasID.rich_text[0].text.content = assignmentCustomProperties.canvasID.toString();
        properties.canvasID.rich_text[0].plain_text = assignmentCustomProperties.canvasID.toString();
    }
    if (assignmentCustomProperties.progress === null) {
        properties.Progress.select = null;
    }
    else {
        properties.Progress.select.name = assignmentCustomProperties.progress;
    }
    if (assignmentCustomProperties.quickNotes === null) {
        properties["Quick Notes"].rich_text = [];
    }
    else {
        properties["Quick Notes"].rich_text[0].text.content = assignmentCustomProperties.quickNotes.toString();
        properties["Quick Notes"].rich_text[0].plain_text = assignmentCustomProperties.quickNotes.toString();
    }
    if (assignmentCustomProperties.category === "") {
        properties.Category.select = null;
    }
    else {
        properties.Category.select.name = assignmentCustomProperties.category;
    }
    properties.Assignment.title[0].text.content = assignmentCustomProperties.assignmentName;
    properties.Assignment.title[0].plain_text = assignmentCustomProperties.assignmentName;
    console.log("properties: ");
    console.dir(properties, { depth: null });
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
    const matchingCanvasIDAssignments = yield (0, exports.getAssignmentRows)(notionClient, matchingCanvasIDFilter);
    return matchingCanvasIDAssignments.length === 0;
});
exports.isNewAssignment = isNewAssignment;
const addNewAssignmentRow = (notionClient, properties) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, Queries_1.createNewPage)(notionClient, NOTION_DB_ASSIGNMENTS, properties);
});
exports.addNewAssignmentRow = addNewAssignmentRow;
