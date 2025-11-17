"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters long").max(255, "Name must be at most 255 characters long"),
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: zod_1.z.string().min(8, "Confirm Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});
