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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotionClient = exports.createNewPage = exports.getDatabase = void 0;
const { Client } = require("@notionhq/client");
const helpers_1 = require("../helpers");
const getDatabase = (notionClient, databaseID, filters = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield notionClient.databases.query({
        database_id: databaseID,
        filter: filters
    }).catch(helpers_1.productionLog)).results;
});
exports.getDatabase = getDatabase;
const createNewPage = (notionClient, parentID, properties) => {
    notionClient.pages.create({
        parent: { database_id: parentID },
        properties
    });
};
exports.createNewPage = createNewPage;
// Initializing a client
const getNotionClient = () => {
    return new Client({
        auth: process.env.NOTION_SECRET,
    });
};
exports.getNotionClient = getNotionClient;
