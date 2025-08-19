"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyUserIdentitySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.VerifyUserIdentitySchema = zod_1.default
    .object({
    userId: zod_1.default
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => Number.isInteger(val) && val > 0, {
        message: "User ID must be a positive integer",
    }).optional(),
    aadhaarNumber: zod_1.default
        .string()
        .regex(/^\d{12}$/, { message: "Aadhaar number must be exactly 12 digits" })
        .optional(),
    drivingLicenseNumber: zod_1.default
        .string()
        .optional(),
})
    .strict()
    .refine((data) => data.aadhaarNumber || data.drivingLicenseNumber, {
    message: "At least one of Aadhaar number or driving license number must be provided",
    path: ["aadhaarNumber", "drivingLicenseNumber"],
});
