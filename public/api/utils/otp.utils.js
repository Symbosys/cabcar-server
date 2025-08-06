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
    const otp = crypto_1.default.randomInt(1000, 10000).toString();
    return otp;
};
exports.generateOtp = generateOtp;
const MSGCLUB_BASE_URL = process.env.MSGCLUB_BASE_URL;
const MSGCLUB_AUTH_KEY = process.env.MSGCLUB_AUTH_KEY;
const MSGCLUB_SENDER_ID = process.env.MSGCLUB_SENDER_ID;
const MSGCLUB_ROUTE_ID = process.env.MSGCLUB_ROUTE_ID;
const sendOtp = (mobile, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const authKey = "34d66a7f7938ef441831817271f9f69a";
    const senderId = "dpkuma";
    const routeId = "8";
    const smsContentType = "english";
    const message = encodeURIComponent(`Dear Customer, ${otp} is your one time password (OTP) to login to Cab Car (https://cabcar.in/). Don't share OTP with anyone. Regards- DEEPAK KUMAR`);
    const url = `http://msg.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=${authKey}&message=${message}&senderId=${senderId}&routeId=${routeId}&mobileNos=${mobile}&smsContentType=${smsContentType}`;
    try {
        const response = yield fetch(url, {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = yield response.text(); // or response.json() if API returns JSON
        console.log("SMS sent successfully:", result);
    }
    catch (error) {
        console.error("Error sending SMS:", error);
        throw error;
    }
});
exports.sendOtp = sendOtp;
