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
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getCarBookings = exports.getVehicleById = exports.getAvailableVehicles = exports.getVehicles = exports.preprocessVehicleData = void 0;
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../../config/cloudinary");
const prisma = new client_1.PrismaClient();
// Type guard for VehicleImages
function isVehicleImages(value) {
    return typeof value === 'object' && value !== null && Object.values(value).every(v => typeof v === 'string');
}
// Zod schemas
const VehicleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    number: zod_1.z.string().min(1, "Number is required"),
    fuel: zod_1.z.string().min(1, "Fuel type is required"),
    transmission: zod_1.z.string().min(1, "Transmission is required"),
    seats: zod_1.z.number().int().positive("Seats must be a positive integer"),
    location: zod_1.z.string().min(1, "Location is required"),
    available: zod_1.z.boolean().default(true),
    pricePerKm: zod_1.z.number().nonnegative().optional(),
    pricePerDay: zod_1.z.number().nonnegative().optional(),
    driverCharge: zod_1.z.number().nonnegative(),
    convenienceFee: zod_1.z.number().nonnegative().default(0),
    tripProtectionFee: zod_1.z.number().nonnegative().default(0),
    deposit: zod_1.z.number().nonnegative(),
    typeId: zod_1.z.number().int().positive().optional().nullable(),
    images: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
const UpdateVehicleSchema = VehicleSchema.partial();
const QuerySchema = zod_1.z.object({
    page: zod_1.z.string().default("1").transform((val) => parseInt(val)),
    limit: zod_1.z.string().default("10").transform((val) => parseInt(val)),
    search: zod_1.z.string().optional(),
    available: zod_1.z.string().optional(),
    sort: zod_1.z.string().default("id:asc"),
});
const BookingQuerySchema = zod_1.z.object({
    vehicleId: zod_1.z.string().transform((val) => parseInt(val)),
    page: zod_1.z.string().default("1").transform((val) => parseInt(val)),
    limit: zod_1.z.string().default("5").transform((val) => parseInt(val)),
});
exports.preprocessVehicleData = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const data = Object.assign({}, req.body);
    // Convert numeric fields
    const numericFields = [
        'seats',
        'pricePerKm',
        'pricePerDay',
        'driverCharge',
        'convenienceFee',
        'tripProtectionFee',
        'deposit',
        'typeId',
    ];
    numericFields.forEach(field => {
        if (typeof data[field] === 'string' && data[field].trim() !== '') {
            const value = parseFloat(data[field]);
            if (!isNaN(value)) {
                data[field] = field === 'seats' || field === 'typeId' ? Math.floor(value) : value;
            }
            else {
                throw new utils_1.ErrorResponse(`Invalid number for ${field}`, types_1.statusCode.Bad_Request);
            }
        }
        else if (data[field] == null || data[field] === '') {
            data[field] = undefined;
        }
    });
    // Convert boolean field
    if (typeof data.available === 'string') {
        if (data.available.toLowerCase() === 'true') {
            data.available = true;
        }
        else if (data.available.toLowerCase() === 'false') {
            data.available = false;
        }
        else {
            throw new utils_1.ErrorResponse('Invalid boolean for available', types_1.statusCode.Bad_Request);
        }
    }
    else if (data.available == null) {
        data.available = true;
    }
    // Parse images field
    if (typeof data.images === 'string' && data.images.trim() !== '') {
        try {
            data.images = JSON.parse(data.images);
        }
        catch (_a) {
            throw new utils_1.ErrorResponse('Invalid JSON for images', types_1.statusCode.Bad_Request);
        }
    }
    else if (data.images == null || data.images === '') {
        data.images = {};
    }
    // Validate with Zod schema
    const schema = req.method === 'POST' ? VehicleSchema : UpdateVehicleSchema;
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new utils_1.ErrorResponse('Invalid vehicle data', types_1.statusCode.Bad_Request);
    }
    req.body = data;
    next();
}));
exports.getVehicles = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, search, available, sort } = QuerySchema.parse(req.query);
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { number: { contains: search } },
        ];
    }
    if (available !== undefined) {
        where.available = available === "true";
    }
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = {};
    if (sortField && sortOrder) {
        orderBy[sortField] = sortOrder;
    }
    else {
        orderBy.id = "asc";
    }
    const [vehicles, total] = yield Promise.all([
        prisma.car.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
            include: {
                type: true,
                bookings: {
                    include: {
                        customer: {
                            select: { id: true, name: true, mobile: true },
                        },
                    },
                },
            },
        }),
        prisma.car.count({ where }),
    ]);
    const vehiclesWithImage = vehicles.map((vehicle) => {
        var _a;
        return (Object.assign(Object.assign({}, vehicle), { imageUrl: isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png', pricePer10Km: `₹${(((_a = vehicle.pricePerKm) !== null && _a !== void 0 ? _a : 0) * 10).toFixed(2)}/10km` }));
    });
    const result = {
        vehicles: vehiclesWithImage,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
    return (0, response_util_1.SuccessResponse)(res, "Vehicles fetched successfully", result, types_1.statusCode.OK);
}));
exports.getAvailableVehicles = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, search, sort } = QuerySchema.parse(req.query);
    const where = { available: true };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { number: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = {};
    if (sortField && sortOrder) {
        orderBy[sortField] = sortOrder;
    }
    else {
        orderBy.id = "asc";
    }
    const [vehicles, total] = yield Promise.all([
        prisma.car.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy,
            include: {
                type: true,
            },
        }),
        prisma.car.count({ where }),
    ]);
    const vehiclesWithImage = vehicles.map((vehicle) => {
        var _a;
        return (Object.assign(Object.assign({}, vehicle), { imageUrl: isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png', pricePer10Km: `₹${(((_a = vehicle.pricePerKm) !== null && _a !== void 0 ? _a : 0) * 10).toFixed(2)}/10km` }));
    });
    const result = {
        vehicles: vehiclesWithImage,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
    return (0, response_util_1.SuccessResponse)(res, "Available vehicles fetched successfully", result, types_1.statusCode.OK);
}));
exports.getVehicleById = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        throw new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request);
    }
    const vehicle = yield prisma.car.findUnique({
        where: { id },
        include: {
            type: true,
            bookings: {
                include: {
                    customer: {
                        select: { id: true, name: true, mobile: true },
                    },
                },
            },
        },
    });
    if (!vehicle) {
        throw new utils_1.ErrorResponse("Vehicle not found", types_1.statusCode.Not_Found);
    }
    const imageUrl = isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png';
    return (0, response_util_1.SuccessResponse)(res, "Vehicle fetched successfully", Object.assign(Object.assign({}, vehicle), { imageUrl, pricePer10Km: `₹${(((_a = vehicle.pricePerKm) !== null && _a !== void 0 ? _a : 0) * 10).toFixed(2)}/10km` }), types_1.statusCode.OK);
}));
exports.getCarBookings = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vehicleId, page, limit } = BookingQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;
    const [bookings, total] = yield Promise.all([
        prisma.booking.findMany({
            where: { vehicleId },
            skip,
            take: limit,
            orderBy: { pickupDate: "desc" },
            include: {
                customer: {
                    select: { id: true, name: true, mobile: true },
                },
            },
        }),
        prisma.booking.count({ where: { vehicleId } }),
    ]);
    const result = {
        bookings: bookings.map((booking) => ({
            id: booking.id,
            booked: booking.pickupDate.toISOString(),
            returned: booking.returnDate.toISOString(),
            by: booking.customer.name,
            number: booking.customer.mobile,
            customerId: booking.customer.id,
            status: booking.status,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
    return (0, response_util_1.SuccessResponse)(res, "Bookings fetched successfully", result, types_1.statusCode.OK);
}));
exports.createVehicle = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const file = req.file;
    const { number, typeId } = data;
    // Check for duplicate vehicle number
    const existingVehicle = yield prisma.car.findUnique({ where: { number } });
    if (existingVehicle) {
        throw new utils_1.ErrorResponse("Vehicle number already exists", types_1.statusCode.Bad_Request);
    }
    // Validate vehicle type if provided
    if (typeId != null) {
        const vehicleType = yield prisma.vehicleType.findUnique({ where: { id: typeId } });
        if (!vehicleType) {
            throw new utils_1.ErrorResponse("Invalid vehicle type ID", types_1.statusCode.Bad_Request);
        }
    }
    // Handle single image upload to Cloudinary
    let image;
    if (!file) {
        throw new utils_1.ErrorResponse("Image is required", types_1.statusCode.Bad_Request);
    }
    const cloudinaryResult = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, "vehicles");
    image = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
    };
    // Create vehicle
    const vehicle = yield prisma.car.create({
        data: {
            name: data.name,
            number: data.number,
            fuel: data.fuel,
            transmission: data.transmission,
            seats: data.seats,
            location: data.location,
            available: data.available,
            pricePerKm: data.pricePerKm,
            pricePerDay: data.pricePerDay,
            driverCharge: data.driverCharge,
            convenienceFee: data.convenienceFee,
            tripProtectionFee: data.tripProtectionFee,
            deposit: data.deposit,
            typeId: typeId !== null && typeId !== void 0 ? typeId : null,
            images: image ? { public_id: image.public_id, url: image.url } : {},
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle created successfully", vehicle, types_1.statusCode.Created);
}));
exports.updateVehicle = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vehicleId = Number(req.params.id);
    if (isNaN(vehicleId) || !vehicleId) {
        throw new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request);
    }
    const data = req.body;
    const files = req.files;
    // Validate vehicle type if provided
    if (data.typeId != null) {
        const vehicleType = yield prisma.vehicleType.findUnique({ where: { id: data.typeId } });
        if (!vehicleType) {
            throw new utils_1.ErrorResponse("Invalid vehicle type ID", types_1.statusCode.Bad_Request);
        }
    }
    // Handle image uploads
    let images = data.images || {};
    if (files && files.length > 0) {
        for (const file of files) {
            const cloudinaryResult = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, "vehicles");
            const key = file.originalname.split('.')[0] || `image${Object.keys(images).length}`;
            images[key] = cloudinaryResult.secure_url;
        }
    }
    const vehicle = yield prisma.car.update({
        where: { id: vehicleId },
        data: Object.assign(Object.assign({}, data), { typeId: (_a = data.typeId) !== null && _a !== void 0 ? _a : null, images }),
    });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle updated successfully", vehicle, types_1.statusCode.OK);
}));
exports.deleteVehicle = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vehicleId = Number(req.params.id);
    if (isNaN(vehicleId) || !vehicleId) {
        throw new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request);
    }
    const vehicle = yield prisma.car.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
        throw new utils_1.ErrorResponse("Vehicle not found", types_1.statusCode.Not_Found);
    }
    yield prisma.car.delete({ where: { id: vehicleId } });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle deleted successfully", null, types_1.statusCode.No_Content);
}));
