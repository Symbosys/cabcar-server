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
exports.updateCar = exports.getCarByID = exports.getALlCar = exports.createCar = void 0;
const config_1 = require("../../config");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const car_validator_1 = require("../validators/car.validator");
exports.createCar = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const ValidData = car_validator_1.CarSchema.parse(req.body);
    const image = req.file;
    if (!image)
        return next(new utils_1.ErrorResponse("Image is required", types_1.statusCode.Bad_Request));
    const existingVehicle = yield config_1.prisma.car.findUnique({
        where: {
            number: ValidData.number,
        },
    });
    if (existingVehicle)
        return next(new utils_1.ErrorResponse("Vehicle number already exists", types_1.statusCode.Bad_Request));
    if (ValidData.typeId != null) {
        const vehicleType = yield config_1.prisma.vehicleType.findUnique({
            where: { id: ValidData.typeId },
        });
        if (!vehicleType) {
            return next(new utils_1.ErrorResponse("Invalid vehicle type ID", types_1.statusCode.Bad_Request));
        }
    }
    let imageToCloudinary;
    const cloudinaryResult = yield (0, config_1.uploadToCloudinary)(image.buffer, "cab-car");
    imageToCloudinary = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
    };
    const vehicle = yield config_1.prisma.car.create({
        data: Object.assign(Object.assign({}, ValidData), { typeId: (_a = ValidData.typeId) !== null && _a !== void 0 ? _a : null, images: imageToCloudinary
                ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url }
                : {} }),
    });
    return res.status(types_1.statusCode.Created).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
    });
}));
exports.getALlCar = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = car_validator_1.GetAllVehiclesFilterSchema.parse(req.query);
    const { page, limit, typeId, ac, seats, available, pricePerKmMax, pricePerDayMax, driverChargeMax, sortBy, sortOrder, search, } = filters;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { number: { contains: search } },
        ];
    }
    if (typeId !== undefined)
        where.typeId = typeId;
    if (ac !== undefined)
        where.ac = ac;
    if (seats !== undefined)
        where.seats = seats;
    if (available !== undefined)
        where.available = available;
    if (pricePerKmMax !== undefined) {
        where.pricePerKm = { gte: 0, lte: pricePerKmMax };
    }
    if (pricePerDayMax !== undefined) {
        where.pricePerDay = { gte: 0, lte: pricePerDayMax };
    }
    if (driverChargeMax !== undefined) {
        where.driverCharge = { gte: 0, lte: driverChargeMax };
    }
    const skip = (page - 1) * limit;
    const [cars, totalCar] = yield Promise.all([
        config_1.prisma.car.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit,
            include: {
                type: true, // Include related VehicleType
            },
        }),
        config_1.prisma.car.count({ where }),
    ]);
    return (0, response_util_1.SuccessResponse)(res, "Vehicles retrieved successfully", {
        cars,
        totalCar,
        totalPage: Math.ceil(totalCar / limit),
        currentPage: page,
        count: cars.length,
    });
}));
exports.getCarByID = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    }
    const car = yield config_1.prisma.car.findUnique({
        where: { id },
        include: {
            type: true, // Include related VehicleType
        },
    });
    if (!car) {
        return next(new utils_1.ErrorResponse(`Car with ID ${id} not found`, types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Car retrieved successfully", car, types_1.statusCode.OK);
}));
exports.updateCar = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    const validData = car_validator_1.CarSchema.partial().parse(req.body);
    const image = req.file;
    // Check if car exists
    const existingCar = yield config_1.prisma.car.findUnique({
        where: { id },
    });
    if (!existingCar) {
        return next(new utils_1.ErrorResponse(`Car with ID ${id} not found`, types_1.statusCode.Not_Found));
    }
    // Check for duplicate vehicle number (if number is being updated)
    if (validData.number && validData.number !== existingCar.number) {
        const duplicateVehicle = yield config_1.prisma.car.findUnique({
            where: { number: validData.number },
        });
        if (duplicateVehicle) {
            return next(new utils_1.ErrorResponse("Vehicle number already exists", types_1.statusCode.Bad_Request));
        }
    }
    // Validate vehicle type if provided
    if (validData.typeId !== undefined && validData.typeId !== null) {
        const vehicleType = yield config_1.prisma.vehicleType.findUnique({
            where: { id: validData.typeId },
        });
        if (!vehicleType) {
            return next(new utils_1.ErrorResponse("Invalid vehicle type ID", types_1.statusCode.Bad_Request));
        }
    }
    let imageToCloudinary;
    let oldImagePublicId;
    // if image is provided
    if (image) {
        // Delete Image from cloudinary
        if (existingCar.images &&
            existingCar.images.public_id) {
            // extract the public id of old image
            const existingImage = existingCar.images;
            oldImagePublicId = existingImage.public_id;
            const deleteFromCloudinary = yield cloudinary_1.default.uploader.destroy(oldImagePublicId);
            if ((deleteFromCloudinary === null || deleteFromCloudinary === void 0 ? void 0 : deleteFromCloudinary.result) !== "ok") {
                return next(new utils_1.ErrorResponse("Failed to delete old image from Cloudinary", types_1.statusCode.Internal_Server_Error));
            }
            // upload the New imamge
            const cloudinaryResult = yield (0, config_1.uploadToCloudinary)(image.buffer, "cab-car");
            imageToCloudinary = {
                public_id: cloudinaryResult.public_id,
                url: cloudinaryResult.secure_url,
            };
        }
    }
    // Prepare update data
    const updateData = Object.assign(Object.assign({}, validData), { typeId: (_a = validData.typeId) !== null && _a !== void 0 ? _a : existingCar.typeId, features: (_b = validData.features) !== null && _b !== void 0 ? _b : existingCar.features, benefits: (_c = validData.benefits) !== null && _c !== void 0 ? _c : existingCar.benefits, images: imageToCloudinary ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url } : existingCar.images });
    // Update car
    const updatedCar = yield config_1.prisma.car.update({
        where: { id },
        data: updateData,
        include: {
            type: true, // Include related VehicleType
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Car updated successfully", updatedCar, types_1.statusCode.OK);
}));
