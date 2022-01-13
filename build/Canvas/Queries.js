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
exports.getClassesBySemester = void 0;
require('dotenv').config();
const axios_1 = __importDefault(require("axios"));
const CLASS_ID_INDICATOR = "<class_id>";
const SEMESTER_ID_INDICATOR = "<semester_id>";
// endpoint to access all active class information
const CLASS_INFO_URL = `https://canvas.instructure.com/api/v1/courses?per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`;
// endpoint to access specific class information
// replace CLASS_ID_INDICATOR for use
const CLASS_COURSE_BY_ID_URL = `https://canvas.instructure.com/api/v1/courses/${CLASS_ID_INDICATOR}/assignments?per_page=100&include=submission&access_token=${process.env.CARMEN_ACCESS_TOKEN}`;
// endpoint to access all classes by semester information
// replace SEMESTER_ID_INDICATOR for use
const CLASS_COURSES_BY_SEMESTER_URL = `https://canvas.instructure.com/api/v1/users/${process.env.CARMEN_USER_ID}/courses?enrollment_term_id=${SEMESTER_ID_INDICATOR}&per_page=100&access_token=${process.env.CARMEN_ACCESS_TOKEN}`;
const getClassesBySemester = (semesterID) => __awaiter(void 0, void 0, void 0, function* () {
    // get aggregate class data by the given semester ID
    const canvasClassData = yield axios_1.default.get(CLASS_COURSES_BY_SEMESTER_URL.replace(SEMESTER_ID_INDICATOR, semesterID));
    console.dir(canvasClassData, { depth: null });
    // filter json to remove unuseful data
});
exports.getClassesBySemester = getClassesBySemester;
