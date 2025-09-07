import { z } from "zod";



export const registerSchema = z.object({
    name:z.string().trim().min(2, "Name must be at least 2 characters long").max(255, "Name must be at most 255 characters long"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});