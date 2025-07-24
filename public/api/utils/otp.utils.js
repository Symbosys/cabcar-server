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
exports.sendOtp = exports.generateOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateOtp = () => {
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    return otp;
};
exports.generateOtp = generateOtp;
const sendOtp = (mobile, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = `Dear Customer, ${otp} is your one time password (OTP) to login to 789. Don't share OTP with anyone. Team Azmobia`;
        const url = `${process.env.AZMOBIA_BASE_URL}?authentic-key=${process.env.AZMOBIA_AUTH_KEY}&senderid=${process.env.AZMOBIA_SENDER_ID}&route=${process.env.AZMOBIA_ROUTE}&templateid=${process.env.AZMOBIA_TEMPLATE_ID}&message=${encodeURIComponent(message)}&number=${mobile}`;
        const response = yield fetch(url);
        if (!response.ok) {
            throw new Error(`SMS API Error: ${response.statusText}`);
        }
        const result = yield response.text();
        console.log("SMS sent successfully:", result);
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
});
exports.sendOtp = sendOtp;
