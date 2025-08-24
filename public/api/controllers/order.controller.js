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
exports.processOrder = exports.getBookingById = exports.getAllBooking = exports.createBooking = void 0;
const config_1 = require("../../config");
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const order_validator_1 = require("../validators/order.validator");
exports.createBooking = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validData = order_validator_1.BookingSchema.parse(req.body);
    console.log("payload", req.body);
    // Additional business logic validations
    // 1. Check if pickup date is in the future
    const currentDate = new Date();
    // 3. Check if vehicle exists
    const vehicle = yield config_1.prisma.car.findUnique({
        where: { id: validData.vehicleId },
    });
    if (!vehicle) {
        return next(new utils_1.ErrorResponse('Vehicle not found', types_1.statusCode.Bad_Request));
    }
    // 4. Check vehicle availability for the requested period
    // const conflictingBooking = await prisma.booking.findFirst({
    //   where: {
    //     vehicleId: validData.vehicleId,
    //     OR: [
    //       {
    //         pickupDate: { lte: validData.returnDate },
    //         returnDate: { gte: validData.pickupDate },
    //       },
    //     ],
    //     status: { in: ['Upcoming', 'Ongoing'] },
    //   },
    // });
    // if (conflictingBooking) {
    //   return next(
    //     new ErrorResponse('Vehicle is not available for the selected dates', statusCode.Conflict)
    //   );
    // }
    // 5. Check if customer exists
    const customer = yield config_1.prisma.user.findUnique({
        where: { id: validData.customerId },
    });
    if (!customer) {
        return next(new utils_1.ErrorResponse('User not found', types_1.statusCode.Bad_Request));
    }
    const booking = yield config_1.prisma.booking.create({
        data: validData,
    });
    return res.status(types_1.statusCode.Created).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
    });
}));
exports.getAllBooking = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = order_validator_1.GetAllBookingsFilterSchema.parse(req.query);
    const { page, limit, vehicleId, customerId, status, paymentStatus, search, } = filters;
    const where = {};
    // Search filter for customer email or vehicle details
    if (search) {
        where.OR = [
            {
                customer: {
                    email: { contains: search },
                },
            },
            {
                car: {
                    OR: [
                        { name: { contains: search } },
                        { model: { contains: search } },
                    ],
                },
            },
        ];
    }
    if (vehicleId !== undefined)
        where.vehicleId = vehicleId;
    if (customerId !== undefined)
        where.customerId = customerId;
    if (status !== undefined)
        where.status = status;
    if (paymentStatus !== undefined)
        where.paymentStatus = paymentStatus;
    const skip = (page - 1) * limit;
    const [bookings, totalBookings] = yield Promise.all([
        config_1.prisma.booking.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        config_1.prisma.booking.count({ where }),
    ]);
    return (0, response_util_1.SuccessResponse)(res, "All Bookings Retrived successfully", {
        bookings,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
        count: bookings.length,
    });
}));
exports.getBookingById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    const booking = yield config_1.prisma.booking.findUnique({
        where: { id },
    });
    if (!booking)
        return next(new utils_1.ErrorResponse(`Booking with ID ${id} not found`, types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Booking Retrived successfully", booking, types_1.statusCode.OK);
}));
exports.processOrder = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const data = order_validator_1.ProcessBookingSchema.parse(req.body);
    if (!id)
        return next(new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request));
    const booking = yield config_1.prisma.booking.findUnique({
        where: { id },
    });
    if (!booking)
        return next(new utils_1.ErrorResponse(`Booking with ID ${id} not found`, types_1.statusCode.Not_Found));
    const updatedBooking = yield config_1.prisma.booking.update({
        where: { id },
        data: {
            status: data.status,
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Booking Retrived successfully", updatedBooking, types_1.statusCode.OK);
}));
