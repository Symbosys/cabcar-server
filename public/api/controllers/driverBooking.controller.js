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
exports.processDriverBooking = exports.getDriverBookingById = exports.getDriverBooking = exports.createDriverBooking = void 0;
const config_1 = require("../../config");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const order_validator_1 = require("../validators/order.validator");
exports.createDriverBooking = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validData = order_validator_1.DriverBookingSchema.parse(req.body);
    // Check if driver exists
    const driver = yield config_1.prisma.driver.findUnique({
        where: { id: validData.driverId },
    });
    if (!driver) {
        return next(new utils_1.ErrorResponse('Driver not found', types_1.statusCode.Bad_Request));
    }
    // const conflictingDriverBooking = await prisma.driverBooking.findFirst({
    //   where: {
    //     driverId: validData.driverId,
    //     OR: [
    //       {
    //         pickupDate: { lte: validData.returnDate },
    //         returnDate: { gte: validData.pickupDate },
    //       },
    //     ],
    //     status: { in: ['Upcoming', 'Ongoing'] },
    //   },
    // });
    // if (conflictingDriverBooking) {
    //   return next(
    //     new ErrorResponse('Driver is not available for the selected dates', statusCode.Conflict)
    //   );
    // }
    const driverBooking = yield config_1.prisma.driverBooking.create({
        data: validData,
    });
    return (0, response_util_1.SuccessResponse)(res, "Driver booking created successfully", driverBooking, types_1.statusCode.Created);
}));
exports.getDriverBooking = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = order_validator_1.GetAllDriverBookingsFilterSchema.parse(req.query);
    const { page, limit, driverId, status, paymentStatus, customerId, search, } = filters;
    const where = {};
    if (search) {
        where.OR = [
            {
                driver: {
                    OR: [
                        { name: { contains: search } },
                        //   { email: { contains: search} },
                    ],
                },
            },
        ];
    }
    if (driverId !== undefined)
        where.driverId = driverId;
    if (customerId !== undefined)
        where.customerId = customerId;
    if (status !== undefined)
        where.status = status;
    if (paymentStatus !== undefined)
        where.paymentStatus = paymentStatus;
    const skip = (page - 1) * limit;
    const [driverBookings, totalDriverBookings] = yield Promise.all([
        config_1.prisma.driverBooking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        config_1.prisma.driverBooking.count({ where }),
    ]);
    return (0, response_util_1.SuccessResponse)(res, "Driver bookings fetched successfully", {
        driverBookings,
        totalDriverBookings,
        currentPage: page,
        totalPages: Math.ceil(totalDriverBookings / limit),
        count: driverBookings.length,
    });
}));
exports.getDriverBookingById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        return next(new utils_1.ErrorResponse('Invalid driver booking ID', types_1.statusCode.Bad_Request));
    }
    const driverBooking = yield config_1.prisma.driverBooking.findUnique({
        where: { id },
    });
    if (!driverBooking) {
        return next(new utils_1.ErrorResponse('Driver booking not found', types_1.statusCode.Bad_Request));
    }
    return (0, response_util_1.SuccessResponse)(res, "Driver booking fetched successfully", driverBooking);
}));
exports.processDriverBooking = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        return next(new utils_1.ErrorResponse('Invalid driver booking ID', types_1.statusCode.Bad_Request));
    }
    const validData = order_validator_1.ProcessDriverBookingSchema.parse(req.body);
    const existingDriverBooking = yield config_1.prisma.driverBooking.findUnique({
        where: { id },
    });
    if (!existingDriverBooking) {
        return next(new utils_1.ErrorResponse('Driver booking not found', types_1.statusCode.Not_Found));
    }
    const updatedDriverBooking = yield config_1.prisma.driverBooking.update({
        where: { id },
        data: {
            status: validData.status,
            paymentStatus: validData.paymentStatus,
            paymentMethod: validData.paymentMethod,
        }
    });
    return (0, response_util_1.SuccessResponse)(res, "Driver booking updated successfully", updatedDriverBooking);
}));
