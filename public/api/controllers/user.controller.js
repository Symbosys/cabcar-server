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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.requestOtp = void 0;
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const config_1 = require("../../config");
const user_validator_1 = require("../validators/user.validator");
exports.requestOtp = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validData = user_validator_1.OtpValidator.parse(req.body);
    const otp = utils_1.OTP.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const existingOtp = yield config_1.prisma.otp.findFirst({
        where: { mobile: validData.mobile },
    });
    if (existingOtp) {
        yield config_1.prisma.otp.delete({ where: { id: existingOtp.id } });
    }
    yield config_1.prisma.otp.create({
        data: { mobile: validData.mobile, otp, expiresAt },
    });
    yield utils_1.OTP.sendOtp(validData.mobile, otp);
    return (0, response_util_1.SuccessResponse)(res, "OTP sent successfully", { mobile: validData.mobile }, types_1.statusCode.OK);
}));
exports.userLogin = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validData = user_validator_1.LoginValidator.parse(req.body);
    const storedOtp = yield config_1.prisma.otp.findFirst({
        where: {
            mobile: validData.mobile,
            otp: validData.otp,
            expiresAt: { gt: new Date() },
        },
    });
    if (!storedOtp) {
        throw new utils_1.ErrorResponse("Invalid or expired OTP", types_1.statusCode.Bad_Request);
    }
    let user = yield config_1.prisma.user.findUnique({
        where: { mobile: validData.mobile },
    });
    if (!user) {
        user = yield config_1.prisma.user.create({
            data: { mobile: validData.mobile, name: "New User" },
        });
    }
    const token = utils_1.jwt.generateToken({
        id: user.id,
    });
    yield config_1.prisma.otp.delete({ where: { id: storedOtp.id } });
    return (0, response_util_1.SuccessResponse)(res, "Login successful", { token, user: { id: user.id, mobile: user.mobile, role: "user" } }, types_1.statusCode.OK);
}));
