"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");

const UserSchema = new mongoose_2.Schema({
    email: { type: String, unique: true },
    password: { type: String, require: true }
});
exports.UserModel = (0, mongoose_2.model)("Users", UserSchema);
const ContentSchema = new mongoose_2.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    link: { type: String, required: true },
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: 'tag' }],
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'Users', required: true }
});
exports.ContentModel = (0, mongoose_2.model)("Contents", ContentSchema);
const LinkSchema = new mongoose_2.Schema({
    hash: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'Users', required: true, unique: true }
});
exports.LinkModel = (0, mongoose_2.model)("link", LinkSchema);
