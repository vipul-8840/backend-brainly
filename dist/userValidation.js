"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const required = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" }),
});
const validate = (req, res, next) => {
    const parseData = required.safeParse(req.body);
    if (!parseData.success) {
        const errorMessages = parseData.error.issues.map((issue) => issue.message);
        res.status(411).json({
            mssg: errorMessages,
        });
        return;
    }
    next();
};
exports.validate = validate;
