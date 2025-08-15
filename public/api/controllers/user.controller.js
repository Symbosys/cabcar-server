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
exports.getUserById = exports.getAllUsers = exports.getDocumentByUserId = exports.verifyDocument = void 0;
const config_1 = require("../../config");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const document_validator_1 = require("../validators/document.validator");
exports.verifyDocument = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validData = document_validator_1.VerifyUserIdentitySchema.parse(req.body);
    const { aadhaarNumber, drivingLicenseNumber } = validData;
    const userId = Number(req.user.id);
    // Check if user exists
    const user = yield config_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return next(new utils_1.ErrorResponse("User not found", types_1.statusCode.Not_Found));
    }
    // Check for duplicate Aadhaar number (if provided and verified elsewhere)
    if (aadhaarNumber) {
        const existingAadhaar = yield config_1.prisma.document.findFirst({
            where: { aadhaarNumber, aadhaarVerified: true },
        });
        if (existingAadhaar && existingAadhaar.userId !== userId) {
            return next(new utils_1.ErrorResponse("Aadhaar number is already verified for another user", types_1.statusCode.Bad_Request));
        }
    }
    // Check for duplicate Driving License number (if provided and verified elsewhere)
    if (drivingLicenseNumber) {
        const existingDL = yield config_1.prisma.document.findFirst({
            where: { drivingLicenseNumber, drivingLicenseVerified: true },
        });
        if (existingDL && existingDL.userId !== userId) {
            return next(new utils_1.ErrorResponse("Driving license number is already verified for another user", types_1.statusCode.Bad_Request));
        }
    }
    // Check if UserIdentity record exists for the user
    const existingIdentity = yield config_1.prisma.document.findUnique({ where: { userId } });
    if (existingIdentity) {
        // Check if provided numbers match verified ones
        if (aadhaarNumber && existingIdentity.aadhaarNumber === aadhaarNumber && existingIdentity.aadhaarVerified) {
            return next(new utils_1.ErrorResponse("Aadhaar number is already verified for this user", types_1.statusCode.Bad_Request));
        }
        if (drivingLicenseNumber &&
            existingIdentity.drivingLicenseNumber === drivingLicenseNumber &&
            existingIdentity.drivingLicenseVerified) {
            return next(new utils_1.ErrorResponse("Driving license number is already verified for this user", types_1.statusCode.Bad_Request));
        }
        // Update existing UserIdentity record
        const updatedIdentity = yield config_1.prisma.document.update({
            where: { userId },
            data: {
                aadhaarNumber: aadhaarNumber || existingIdentity.aadhaarNumber || null,
                drivingLicenseNumber: drivingLicenseNumber || existingIdentity.drivingLicenseNumber || null,
                aadhaarVerified: aadhaarNumber ? true : existingIdentity.aadhaarVerified,
                drivingLicenseVerified: drivingLicenseNumber ? true : existingIdentity.drivingLicenseVerified,
            },
        });
        return (0, response_util_1.SuccessResponse)(res, "User identity updated successfully", updatedIdentity, types_1.statusCode.OK);
    }
    // Create new UserIdentity record
    const newIdentity = yield config_1.prisma.document.create({
        data: {
            userId,
            aadhaarNumber: aadhaarNumber || null,
            drivingLicenseNumber: drivingLicenseNumber || null,
            aadhaarVerified: aadhaarNumber ? true : false, // Default to true (no external API)
            drivingLicenseVerified: drivingLicenseNumber ? true : false, // Default to true (no external API)
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "User identity created successfully", newIdentity, types_1.statusCode.Created);
}));
exports.getDocumentByUserId = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    if (!userId || isNaN(userId)) {
        return next(new utils_1.ErrorResponse("Invalid user id", types_1.statusCode.Bad_Request));
    }
    const user = yield config_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return next(new utils_1.ErrorResponse("User not found", types_1.statusCode.Not_Found));
    }
    const document = yield config_1.prisma.document.findUnique({ where: { userId } });
    if (!document) {
        return next(new utils_1.ErrorResponse("Document not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Document found", document, types_1.statusCode.OK);
}));
// get ALl users
exports.getAllUsers = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.params.page);
    const limit = Number(req.params.limit);
    const search = req.params.search;
    const where = {};
    if (search) {
        where.OR = [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
        ];
    }
    const skip = (page - 1) * limit;
    const [totalUser, users] = yield Promise.all([
        config_1.prisma.user.count({ where }),
        config_1.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        })
    ]);
    return (0, response_util_1.SuccessResponse)(res, "All user Retrived successfully", {
        users,
        totalUser,
        currentPage: page,
        totalPages: Math.ceil(totalUser / limit),
        count: users.length
    });
}));
exports.getUserById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    if (!userId || isNaN(userId)) {
        return next(new utils_1.ErrorResponse("Invalid user id", types_1.statusCode.Bad_Request));
    }
    const user = yield config_1.prisma.user.findUnique({ where: { id: userId }, include: { documents: true } });
    if (!user) {
        return next(new utils_1.ErrorResponse("User not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "User found", user, types_1.statusCode.OK);
}));
