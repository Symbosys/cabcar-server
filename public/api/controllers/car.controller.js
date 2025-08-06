"use strict";
// import { Request, Response, NextFunction } from "express";
// import { asyncHandler } from "../middlewares";
// import { statusCode } from "../types/types";
// import { ErrorResponse } from "../utils";
// import { SuccessResponse } from "../utils/response.util";
// import { z } from "zod";
// import { PrismaClient } from "@prisma/client";
// import { uploadToCloudinary } from "../../config/cloudinary";
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
// const prisma = new PrismaClient();
// // Type for images field
// interface VehicleImages {
//   [key: string]: string;
// }
// // Type guard for VehicleImages
// function isVehicleImages(value: unknown): value is VehicleImages {
//   return typeof value === 'object' && value !== null && Object.values(value).every(v => typeof v === 'string');
// }
// // Interface for VehicleImage
// interface VehicleImage {
//   public_id: string;
//   url: string;
// }
// // Zod schemas
// const VehicleSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   number: z.string().min(1, "Number is required"),
//   fuel: z.string().min(1, "Fuel type is required"),
//   transmission: z.string().min(1, "Transmission is required"),
//   seats: z.number().int().positive("Seats must be a positive integer"),
//   location: z.string().min(1, "Location is required"),
//   available: z.boolean().default(true),
//   pricePerKm: z.number().nonnegative().optional(),
//   pricePerDay: z.number().nonnegative().optional(),
//   driverCharge: z.number().nonnegative(),
//   convenienceFee: z.number().nonnegative().default(0),
//   tripProtectionFee: z.number().nonnegative().default(0),
//   deposit: z.number().nonnegative(),
//   typeId: z.number().int().positive().optional().nullable(),
//   images: z.record(z.string(), z.string()).optional(),
// });
// const UpdateVehicleSchema = VehicleSchema.partial();
// const QuerySchema = z.object({
//   page: z.string().default("1").transform((val) => parseInt(val)),
//   limit: z.string().default("10").transform((val) => parseInt(val)),
//   search: z.string().optional(),
//   available: z.string().optional(),
//   sort: z.string().default("id:asc"),
// });
// const BookingQuerySchema = z.object({
//   vehicleId: z.string().transform((val) => parseInt(val)),
//   page: z.string().default("1").transform((val) => parseInt(val)),
//   limit: z.string().default("5").transform((val) => parseInt(val)),
// });
// export const preprocessVehicleData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   const data = { ...req.body };
//   // Convert numeric fields
//   const numericFields = [
//     'seats',
//     'pricePerKm',
//     'pricePerDay',
//     'driverCharge',
//     'convenienceFee',
//     'tripProtectionFee',
//     'deposit',
//     'typeId',
//   ];
//   numericFields.forEach(field => {
//     if (typeof data[field] === 'string' && data[field].trim() !== '') {
//       const value = parseFloat(data[field]);
//       if (!isNaN(value)) {
//         data[field] = field === 'seats' || field === 'typeId' ? Math.floor(value) : value;
//       } else {
//         throw new ErrorResponse(`Invalid number for ${field}`, statusCode.Bad_Request);
//       }
//     } else if (data[field] == null || data[field] === '') {
//       data[field] = undefined;
//     }
//   });
//   // Convert boolean field
//   if (typeof data.available === 'string') {
//     if (data.available.toLowerCase() === 'true') {
//       data.available = true;
//     } else if (data.available.toLowerCase() === 'false') {
//       data.available = false;
//     } else {
//       throw new ErrorResponse('Invalid boolean for available', statusCode.Bad_Request);
//     }
//   } else if (data.available == null) {
//     data.available = true;
//   }
//   // Parse images field
//   if (typeof data.images === 'string' && data.images.trim() !== '') {
//     try {
//       data.images = JSON.parse(data.images);
//     } catch {
//       throw new ErrorResponse('Invalid JSON for images', statusCode.Bad_Request);
//     }
//   } else if (data.images == null || data.images === '') {
//     data.images = {};
//   }
//   // Validate with Zod schema
//   const schema = req.method === 'POST' ? VehicleSchema : UpdateVehicleSchema;
//   const result = schema.safeParse(data);
//   if (!result.success) {
//     throw new ErrorResponse('Invalid vehicle data', statusCode.Bad_Request);
//   }
//   req.body = data;
//   next();
// });
// export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
//   const { page, limit, search, available, sort } = QuerySchema.parse(req.query);
//   const where: any = {};
//   if (search) {
//     where.OR = [
//       { name: { contains: search} },
//       { number: { contains: search} },
//     ];
//   }
//   if (available !== undefined) {
//     where.available = available === "true";
//   }
//   const [sortField, sortOrder] = sort.split(":");
//   const orderBy: any = {};
//   if (sortField && sortOrder) {
//     orderBy[sortField] = sortOrder;
//   } else {
//     orderBy.id = "asc";
//   }
//   const [vehicles, total] = await Promise.all([
//     prisma.car.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy,
//       include: {
//         type: true,
//         bookings: {
//           include: {
//             customer: {
//               select: { id: true, name: true, mobile: true },
//             },
//           },
//         },
//       },
//     }),
//     prisma.car.count({ where }),
//   ]);
//   const vehiclesWithImage = vehicles.map((vehicle: any) => ({
//     ...vehicle,
//     imageUrl: isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png',
//     pricePer10Km: `₹${((vehicle.pricePerKm ?? 0) * 10).toFixed(2)}/10km`,
//   }));
//   const result = {
//     vehicles: vehiclesWithImage,
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//   };
//   return SuccessResponse(res, "Vehicles fetched successfully", result, statusCode.OK);
// });
// export const getAvailableVehicles = asyncHandler(async (req: Request, res: Response) => {
//   const { page, limit, search, sort } = QuerySchema.parse(req.query);
//   const where: any = { available: true };
//   if (search) {
//     where.OR = [
//       { name: { contains: search, mode: 'insensitive' } },
//       { number: { contains: search, mode: 'insensitive' } },
//     ];
//   }
//   const [sortField, sortOrder] = sort.split(":");
//   const orderBy: any = {};
//   if (sortField && sortOrder) {
//     orderBy[sortField] = sortOrder;
//   } else {
//     orderBy.id = "asc";
//   }
//   const [vehicles, total] = await Promise.all([
//     prisma.car.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy,
//       include: {
//         type: true,
//       },
//     }),
//     prisma.car.count({ where }),
//   ]);
//   const vehiclesWithImage = vehicles.map((vehicle: any) => ({
//     ...vehicle,
//     imageUrl: isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png',
//     pricePer10Km: `₹${((vehicle.pricePerKm ?? 0) * 10).toFixed(2)}/10km`,
//   }));
//   const result = {
//     vehicles: vehiclesWithImage,
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//   };
//   return SuccessResponse(res, "Available vehicles fetched successfully", result, statusCode.OK);
// });
// export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   if (isNaN(id) || !id) {
//     throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
//   }
//   const vehicle = await prisma.car.findUnique({
//     where: { id },
//     include: {
//       type: true,
//       bookings: {
//         include: {
//           customer: {
//             select: { id: true, name: true, mobile: true },
//           },
//         },
//       },
//     },
//   });
//   if (!vehicle) {
//     throw new ErrorResponse("Vehicle not found", statusCode.Not_Found);
//   }
//   const imageUrl = isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png';
//   return SuccessResponse(
//     res,
//     "Vehicle fetched successfully",
//     {
//       ...vehicle,
//       imageUrl,
//       pricePer10Km: `₹${((vehicle.pricePerKm ?? 0) * 10).toFixed(2)}/10km`,
//     },
//     statusCode.OK
//   );
// });
// export const getCarBookings = asyncHandler(async (req: Request, res: Response) => {
//   const { vehicleId, page, limit } = BookingQuerySchema.parse(req.query);
//   const skip = (page - 1) * limit;
//   const [bookings, total] = await Promise.all([
//     prisma.booking.findMany({
//       where: { vehicleId },
//       skip,
//       take: limit,
//       orderBy: { pickupDate: "desc" },
//       include: {
//         customer: {
//           select: { id: true, name: true, mobile: true },
//         },
//       },
//     }),
//     prisma.booking.count({ where: { vehicleId } }),
//   ]);
//   const result = {
//     bookings: bookings.map((booking: any) => ({
//       id: booking.id,
//       booked: booking.pickupDate.toISOString(),
//       returned: booking.returnDate.toISOString(),
//       by: booking.customer.name,
//       number: booking.customer.mobile,
//       customerId: booking.customer.id,
//       status: booking.status,
//     })),
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//   };
//   return SuccessResponse(res, "Bookings fetched successfully", result, statusCode.OK);
// });
// export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
//   const data = req.body;
//   const file = req.file as Express.Multer.File;
//   const { number, typeId } = data;
//   // Check for duplicate vehicle number
//   const existingVehicle = await prisma.car.findUnique({ where: { number } });
//   if (existingVehicle) {
//     throw new ErrorResponse("Vehicle number already exists", statusCode.Bad_Request);
//   }
//   // Validate vehicle type if provided
//   if (typeId != null) {
//     const vehicleType = await prisma.vehicleType.findUnique({ where: { id: typeId } });
//     if (!vehicleType) {
//       throw new ErrorResponse("Invalid vehicle type ID", statusCode.Bad_Request);
//     }
//   }
//   // Handle single image upload to Cloudinary
//   let image: VehicleImage | undefined;
//   if (!file) {
//     throw new ErrorResponse("Image is required", statusCode.Bad_Request);
//   }
//   const cloudinaryResult = await uploadToCloudinary(file.buffer, "vehicles");
//   image = {
//     public_id: cloudinaryResult.public_id,
//     url: cloudinaryResult.secure_url,
//   };
//   // Create vehicle
//   const vehicle = await prisma.car.create({
//     data: {
//       name: data.name,
//       number: data.number,
//       fuel: data.fuel,
//       transmission: data.transmission,
//       seats: data.seats,
//       location: data.location,
//       available: data.available,
//       pricePerKm: data.pricePerKm,
//       pricePerDay: data.pricePerDay,
//       driverCharge: data.driverCharge,
//       convenienceFee: data.convenienceFee,
//       tripProtectionFee: data.tripProtectionFee,
//       deposit: data.deposit,
//       typeId: typeId ?? null,
//       images: image ? { public_id: image.public_id, url: image.url } : {},
//     },
//   });
//   return SuccessResponse(res, "Vehicle created successfully", vehicle, statusCode.Created);
// });
// export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
//   const vehicleId = Number(req.params.id);
//   if (isNaN(vehicleId) || !vehicleId) {
//     throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
//   }
//   const data = req.body;
//   const files = req.files as Express.Multer.File[];
//   // Validate vehicle type if provided
//   if (data.typeId != null) {
//     const vehicleType = await prisma.vehicleType.findUnique({ where: { id: data.typeId } });
//     if (!vehicleType) {
//       throw new ErrorResponse("Invalid vehicle type ID", statusCode.Bad_Request);
//     }
//   }
//   // Handle image uploads
//   let images: VehicleImages = data.images || {};
//   if (files && files.length > 0) {
//     for (const file of files) {
//       const cloudinaryResult = await uploadToCloudinary(file.buffer, "vehicles");
//       const key = file.originalname.split('.')[0] || `image${Object.keys(images).length}`;
//       images[key] = cloudinaryResult.secure_url;
//     }
//   }
//   const vehicle = await prisma.car.update({
//     where: { id: vehicleId },
//     data: {
//       ...data,
//       typeId: data.typeId ?? null,
//       images,
//     },
//   });
//   return SuccessResponse(res, "Vehicle updated successfully", vehicle, statusCode.OK);
// });
// export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
//   const vehicleId = Number(req.params.id);
//   if (isNaN(vehicleId) || !vehicleId) {
//     throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
//   }
//   const vehicle = await prisma.car.findUnique({ where: { id: vehicleId } });
//   if (!vehicle) {
//     throw new ErrorResponse("Vehicle not found", statusCode.Not_Found);
//   }
//   await prisma.car.delete({ where: { id: vehicleId } });
//   return SuccessResponse(res, "Vehicle deleted successfully", null, statusCode.No_Content);
// });
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
    if (id || isNaN(id))
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
