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
exports.updateDriver = exports.getDriverById = exports.getAllDriver = exports.createDriver = void 0;
const config_1 = require("../../config");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const driver_validator_1 = require("../validators/driver.validator");
exports.createDriver = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = driver_validator_1.DriverSchema.parse(req.body);
    const { licenseNumber } = data;
    const image = req.file;
    // Check for duplicate licenseNumber
    const existingDriver = yield config_1.prisma.driver.findUnique({
        where: { licenseNumber },
    });
    if (existingDriver) {
        return next(new utils_1.ErrorResponse("License number already exists", types_1.statusCode.Bad_Request));
    }
    // Handle image upload to Cloudinary if provided
    let imageToCloudinary;
    if (image) {
        try {
            const cloudinaryResult = yield (0, config_1.uploadToCloudinary)(image.buffer, "cab-car/driver");
            imageToCloudinary = {
                public_id: cloudinaryResult.public_id,
                url: cloudinaryResult.secure_url,
            };
        }
        catch (error) {
            return next(new utils_1.ErrorResponse("Failed to upload image to Cloudinary", types_1.statusCode.Internal_Server_Error));
        }
    }
    // Create driver with Prisma
    const driver = yield config_1.prisma.driver.create({
        data: Object.assign(Object.assign({}, data), { image: imageToCloudinary ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url } : {} }),
    });
    return (0, response_util_1.SuccessResponse)(res, "Driver created successfully", driver, types_1.statusCode.Created);
}));
exports.getAllDriver = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = driver_validator_1.GetAllDriversQuerySchema.parse(req.query);
    const { page, limit, available, isActive, experienceYearsMin, experienceYearsMax, search, } = query;
    // Build Prisma where clause
    const where = {};
    if (available !== undefined)
        where.available = available;
    if (isActive !== undefined)
        where.isActive = isActive;
    if (experienceYearsMin !== undefined)
        where.experienceYears = { gte: experienceYearsMin };
    if (experienceYearsMax !== undefined)
        where.experienceYears = Object.assign(Object.assign({}, where.experienceYears), { lte: experienceYearsMax });
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { licenseNumber: { contains: search } },
            { location: { contains: search } },
        ];
    }
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalDrivers = yield config_1.prisma.driver.count({ where });
    const totalPages = Math.ceil(totalDrivers / limit);
    // Fetch drivers
    const drivers = yield config_1.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        select: {
            id: true,
            name: true,
            licenseNumber: true,
            location: true,
            experienceYears: true,
            image: true,
            available: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "rivers retrieved successfully", {
        drivers,
        totalDrivers,
        totalPages,
        currentPage: page,
        count: drivers.length
    });
}));
exports.getDriverById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    }
    const driver = yield config_1.prisma.driver.findUnique({
        where: { id },
    });
    if (!driver) {
        return next(new utils_1.ErrorResponse(`Driver with ID ${id} not found`, types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Driver retrieved successfully", driver, types_1.statusCode.OK);
}));
exports.updateDriver = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    const validData = driver_validator_1.DriverSchema.partial().parse(req.body);
    const image = req.file;
    // Check if driver exists
    const existingDriver = yield config_1.prisma.driver.findUnique({
        where: { id },
    });
    if (!existingDriver) {
        return next(new utils_1.ErrorResponse(`Driver with ID ${id} not found`, types_1.statusCode.Not_Found));
    }
    // check for duplicate licenseNumber
    if (validData.licenseNumber) {
        const existingLicenseNumber = yield config_1.prisma.driver.findFirst({
            where: {
                licenseNumber: validData.licenseNumber,
                NOT: { id },
            },
        });
        if (existingLicenseNumber) {
            return next(new utils_1.ErrorResponse("License number already exists", types_1.statusCode.Bad_Request));
        }
    }
    // Handle image upload to Cloudinary if provided
    let imageToCloudinary;
    let oldImagePublicId;
    if (image) {
        if (existingDriver.image && existingDriver.image.public_id) {
            // extract the public id of old image
            const existingImage = existingDriver.image;
            oldImagePublicId = existingImage.public_id;
            const deleteFromCloudinary = yield cloudinary_1.default.uploader.destroy(oldImagePublicId);
            if (deleteFromCloudinary.result !== "ok") {
                return next(new utils_1.ErrorResponse("Failed to delete old image from Cloudinary", types_1.statusCode.Internal_Server_Error));
            }
            // upload the New image
            const cloudinaryResult = yield (0, config_1.uploadToCloudinary)(image.buffer, "cab-car/driver");
            imageToCloudinary = {
                public_id: cloudinaryResult.public_id,
                url: cloudinaryResult.secure_url,
            };
        }
    }
    // Prepare upadate data
    const upadateData = Object.assign(Object.assign({}, validData), { image: imageToCloudinary ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url } : {} });
    // Update driver with Prisma
    const driver = yield config_1.prisma.driver.update({
        where: { id },
        data: upadateData,
    });
    return (0, response_util_1.SuccessResponse)(res, "Driver updated successfully", driver, types_1.statusCode.OK);
}));
