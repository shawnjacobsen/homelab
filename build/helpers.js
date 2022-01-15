"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterKeysOfObject = exports.logError = exports.isNumber = exports.isProduction = void 0;
require('dotenv').config();
// assume production build if env variable is missing
const isProduction = () => !process.env.PRODUCTION || Number.parseInt(process.env.PRODUCTION) === 1;
exports.isProduction = isProduction;
const isNumber = (test) => { return /^\d+$/.test(test); };
exports.isNumber = isNumber;
const logError = (e) => {
    console.log("Is production?", (0, exports.isProduction)());
    if ((0, exports.isProduction)()) {
        // TODO
        // production log to some log system
    }
    else {
        console.log("-------------\n");
        console.log(e);
        console.log("-------------\n");
    }
};
exports.logError = logError;
const filterKeysOfObject = (obj, allowed) => {
    return Object.keys(obj).filter(key => allowed.includes(key)).reduce((prevObj, key) => {
        prevObj[key] = obj[key];
        return prevObj;
    }, {});
};
exports.filterKeysOfObject = filterKeysOfObject;
