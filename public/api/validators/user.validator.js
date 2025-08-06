"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginValidator = exports.OtpValidator = void 0;
const zod_1 = __importDefault(require("zod"));
exports.OtpValidator = zod_1.default.object({
    mobile: zod_1.default.string().regex(/^\+?\d{10,15}$/, "Invalid mobile number"),
});
exports.LoginValidator = zod_1.default.object({
    mobile: zod_1.default.string().regex(/^\+?\d{10,15}$/, "Invalid mobile number"),
    otp: zod_1.default.string().length(4, "OTP must be 4 digits"),
});
