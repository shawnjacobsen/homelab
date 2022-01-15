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
const { Client } = require("@notionhq/client");
require('dotenv').config();
const assignmentDB_1 = require("./assignmentDB");
const helpers_1 = require("../helpers");
// Initializing a client
const notion = new Client({
    auth: process.env.NOTION_SECRET,
});
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    const retrievedDatabase = yield (0, assignmentDB_1.getDatabase)(notion, process.env.NOTION_DB_TEST);
    console.dir(retrievedDatabase, {});
    if ((0, helpers_1.isProduction)()) {
        retrievedDatabase.results.forEach((row) => {
            console.dir(row.properties, { depth: null });
            console.log("-------------\n");
        });
    }
    const newPage = notion.pages.create({
        parent: { database_id: process.env.NOTION_DB_TEST },
        properties: {
            Name: {
                id: 'title',
                type: 'title',
                'title': [{
                        type: 'text',
                        text: { content: 'NEW ITEM', link: null },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: 'default'
                        },
                        plain_text: 'NEW ITEM',
                        href: null
                    }]
            }
        }
    });
    const updatedDatabase = yield notion.databases.update({
        database_id: process.env.NOTION_DB_TEST
    });
    console.log(updatedDatabase);
});
