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
exports.getAssignmentsByCourseID = exports.COURSE_BY_ID_URL = exports.COURSE_INFO_URL = exports.CANVAS_BASE_URL = void 0;
require('dotenv').config();
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("../helpers");
const COURSE_ID_INDICATOR = "<course_id>";
// base URL
exports.CANVAS_BASE_URL = `https://canvas.instructure.com`;
// endpoint to access all active course information
exports.COURSE_INFO_URL = `${exports.CANVAS_BASE_URL}/api/v1/courses?per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`;
// endpoint to access specific course information
// replace COURSE_ID_INDICATOR when called
exports.COURSE_BY_ID_URL = `${exports.CANVAS_BASE_URL}/api/v1/courses/${COURSE_ID_INDICATOR}/assignments?per_page=100&include=submission&access_token=${process.env.CARMEN_ACCESS_TOKEN}`;
const getAssignmentsByCourseID = (courseID, allowedFields) => __awaiter(void 0, void 0, void 0, function* () {
    const httpData = yield axios_1.default.get(exports.COURSE_BY_ID_URL.replace(COURSE_ID_INDICATOR, courseID));
    // filter assignment data to useable fields
    const filteredAssignmentData = httpData.data.map(assignment => (0, helpers_1.filterKeysOfObject)(assignment, allowedFields));
    // adapt proper canvas course key to assignments
    filteredAssignmentData.forEach(assignment => assignment.course_id = courseID);
    return filteredAssignmentData;
});
exports.getAssignmentsByCourseID = getAssignmentsByCourseID;
