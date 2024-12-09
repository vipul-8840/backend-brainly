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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const userValidation_1 = require("./userValidation");
const contentValidation_1 = require("./contentValidation");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post('/api/v1/sign-up', userValidation_1.validate, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const existingUser = yield db_1.UserModel.findOne({
                email: email
            });
            if (existingUser) {
                res.status(400).json({
                    mssg: "User already exist"
                });
                return;
            }
            const hashpassword = yield bcrypt_1.default.hash(password, 5);
            yield db_1.UserModel.create({
                email: email,
                password: hashpassword
            });
            res.status(200).json({
                mssg: "User created successfully",
            });
        }
        catch (err) {
            console.error("Error during user creation:", err);
            res.status(500).json({
                mssg: "Internal server error",
                error: err.message,
            });
        }
    });
});
app.post('/api/v1/sign-in', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const existingUser = yield db_1.UserModel.findOne({
                email: email
            });
            if (!existingUser) {
                res.status(401).json({
                    mssg: "wrong email"
                });
                return;
            }
            const passwordmatch = yield bcrypt_1.default.compare(password, existingUser.password);
            if (!passwordmatch) {
                res.status(401).json({
                    mssg: "wrong password"
                });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                id: existingUser._id
            }, config_1.JWT_SECRET);
            res.status(200).json({
                token: token
            });
        }
        catch (err) {
            console.error("Error during sign-in:", err);
            res.status(500).json({
                message: "Internal server error",
                error: err.message,
            });
        }
    });
});
app.post('/api/v1/content', middleware_1.userMiddleware, contentValidation_1.contnetValidation, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const link = req.body.link;
            const type = req.body.type;
            yield db_1.ContentModel.create({
                link: link,
                type: type,
                title: req.body.title,
                //@ts-ignore
                userId: req.userId,
                tag: []
            });
            res.status(200).json({
                mssg: "content added"
            });
        }
        catch (err) {
            console.error("Error during user creation:", err);
            res.status(500).json({
                mssg: "Internal server error",
                error: err.message,
            });
        }
    });
});
app.get('/api/v1/content', middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // @ts-ignore
            const userId = req.userId;
            const content = yield db_1.ContentModel.find({ userId }).populate("userId", "email");
            if (content.length > 0) {
                res.status(200).json({
                    content
                });
                return;
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                mssg: "An error occurred while retrieving content",
            });
        }
    });
});
app.delete('/api/v1/content', middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //@ts-ignore
            const userId = req.userId;
            const contentId = req.query.id;
            console.log(contentId);
            if (!contentId) {
                res.status(400).json({
                    mssg: "Content ID is required",
                });
                return;
            }
            const result = yield db_1.ContentModel.deleteOne({
                _id: contentId,
            });
            console.log(result);
            res.status(200).json({
                mssg: "Content deleted successfully",
            });
            return;
        }
        catch (err) {
            console.error("Error deleting content:", err);
            res.status(500).json({
                mssg: "Internal server error",
                error: err.message,
            });
        }
    });
});
app.post("/api/v1/brain/share", middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const share = req.body.share;
            if (typeof share !== "boolean") {
                res.status(400).json({ message: "Invalid share value" });
                return;
            }
            //@ts-ignore
            const userId = req.userId;
            if (share) {
                const existingLink = yield db_1.LinkModel.findOne({ userId });
                if (existingLink) {
                    res.json({ hash: existingLink.hash });
                    return;
                }
                const hash = (0, utils_1.random)(10);
                if (share) {
                    const link = yield db_1.LinkModel.create({
                        //@ts-ignore
                        userId: req.userId,
                        hash,
                    });
                    res.json({
                        hash
                    });
                    return;
                }
                else {
                    yield db_1.LinkModel.deleteOne({
                        //@ts-ignore
                        userId: req.userId
                    });
                    res.json({
                        message: "Link removed successfully",
                    });
                    return;
                }
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
});
app.get('/api/v1/brain/:shareLink', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = req.params.shareLink;
        if (!hash) {
            res.status(400).json({ message: "Invalid or missing hash" });
            return;
        }
        try {
            const link = yield db_1.LinkModel.findOne({ hash });
            if (!link) {
                res.json({ message: "Wrong hash" });
                return;
            }
            const content = yield db_1.ContentModel.findOne({ userId: link.userId });
            const user = yield db_1.UserModel.findOne({ _id: link.userId });
            if (!user) {
                res.json({ message: "User not found, something went wrong" });
                return;
            }
            res.json({
                email: user.email,
                content: content
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
});
app.listen(3000);
