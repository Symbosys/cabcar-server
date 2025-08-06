"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllDriversQuerySchema = exports.DriverSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.DriverSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(1, { message: "Name is required" })
        .max(255, { message: "Name must be 255 characters or less" })
        .trim(),
    licenseNumber: zod_1.default
        .string()
        .min(1, { message: "License number is required" })
        .max(50, { message: "License number must be 50 characters or less" })
        .regex(/^[A-Z0-9-]+$/, { message: "License number must contain only uppercase letters, numbers, or hyphens" }),
    location: zod_1.default
        .string()
        .max(255, { message: "Location must be 255 characters or less" })
        .optional()
        .nullable(),
    experienceYears: zod_1.default
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val >= 0, {
        message: "Experience years must be a non-negative integer",
    }),
    available: zod_1.default
        .string()
        .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
        .refine((val) => val !== undefined, { message: "Available must be a boolean (true or false)" })
        .default(true),
    isActive: zod_1.default
        .string()
        .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
        .refine((val) => val !== undefined, { message: "IsActive must be a boolean (true or false)" })
        .default(true),
}).strict();
exports.GetAllDriversQuerySchema = zod_1.default.object({
    page: zod_1.default
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, { message: "Page must be a positive integer" }),
    limit: zod_1.default
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0, { message: "Limit must be a positive integer" }),
    available: zod_1.default
        .string()
        .optional()
        .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
        .refine((val) => val === undefined || typeof val === "boolean", {
        message: "Available must be a boolean (true or false)",
    }),
    isActive: zod_1.default
        .string()
        .optional()
        .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
        .refine((val) => val === undefined || typeof val === "boolean", {
        message: "IsActive must be a boolean (true or false)",
    }),
    experienceYearsMin: zod_1.default
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
        message: "Minimum experience years must be a non-negative integer",
    }),
    experienceYearsMax: zod_1.default
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
        message: "Maximum experience years must be a non-negative integer",
    }),
    location: zod_1.default
        .string()
        .max(255, { message: "Location must be 255 characters or less" })
        .optional(),
    search: zod_1.default
        .string()
        .max(255, { message: "Search query must be 255 characters or less" })
        .optional(),
    sortBy: zod_1.default
        .enum(["experienceYears", "createdAt", "name"], {
        message: "sortBy must be one of [experienceYears, createdAt, name]",
    })
        .optional()
        .default("createdAt"),
    sortOrder: zod_1.default
        .enum(["asc", "desc"], {
        message: "sortOrder must be either asc or desc",
    })
        .optional()
        .default("desc"),
}).strict()
    .refine((data) => data.experienceYearsMin === undefined ||
    data.experienceYearsMax === undefined ||
    data.experienceYearsMin <= data.experienceYearsMax, {
    message: "Minimum experience years must not exceed maximum experience years",
    path: ["experienceYearsMin"],
});
