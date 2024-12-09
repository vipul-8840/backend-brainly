"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contnetValidation = exports.required = void 0;
const zod_1 = require("zod");
exports.required = zod_1.z.object({
    link: zod_1.z.string().url({ message: "Invalid URL format" }),
    title: zod_1.z.string().min(1, { message: "Title is required" }),
});
const contnetValidation = (req, res, next) => {
    const parseData = exports.required.safeParse(req.body);
    if (!parseData.success) {
        const errorMessages = parseData.error.issues.map((issue) => issue.message);
        res.status(411).json({
            mssg: errorMessages,
        });
        return;
    }
    next();
};
exports.contnetValidation = contnetValidation;
