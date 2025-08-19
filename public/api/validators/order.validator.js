"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessDriverBookingSchema = exports.GetAllDriverBookingsFilterSchema = exports.DriverBookingSchema = exports.ProcessBookingSchema = exports.GetAllBookingsFilterSchema = exports.BookingSchema = exports.PaymentMethodEnum = exports.PaymentStatusEnum = exports.OrderStatusEnum = void 0;
const zod_1 = require("zod");
exports.OrderStatusEnum = zod_1.z.enum(['Upcoming', 'Ongoing', 'Completed']);
exports.PaymentStatusEnum = zod_1.z.enum(['Pending', 'Paid', 'Failed', 'Refunded']);
exports.PaymentMethodEnum = zod_1.z.enum(['Cash', 'Razapay']);
exports.BookingSchema = zod_1.z.object({
    vehicleId: zod_1.z.number().int().positive(),
    customerId: zod_1.z.number().int().positive(),
    pickupDate: zod_1.z.string().datetime().transform((val) => new Date(val)),
    returnDate: zod_1.z.string().datetime().transform((val) => new Date(val)),
    amount: zod_1.z.number().positive(),
    driver: zod_1.z.boolean().default(false),
    address: zod_1.z.string().min(1).max(1000).optional(),
    status: exports.OrderStatusEnum.default('Upcoming'),
    paymentStatus: exports.PaymentStatusEnum.default('Pending'),
    paymentMethod: exports.PaymentMethodEnum.default('Cash'),
});
// Zod schema for query filters
exports.GetAllBookingsFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(10),
    vehicleId: zod_1.z.coerce.number().int().positive().optional(),
    customerId: zod_1.z.coerce.number().int().positive().optional(),
    status: exports.OrderStatusEnum.optional(),
    paymentStatus: exports.PaymentStatusEnum.optional(),
    paymentMethod: exports.PaymentMethodEnum.optional(),
    search: zod_1.z.string().optional(),
});
exports.ProcessBookingSchema = zod_1.z.object({
    status: exports.OrderStatusEnum.optional(),
    paymentStatus: exports.PaymentStatusEnum.optional(),
    paymentMethod: exports.PaymentMethodEnum.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (status, paymentStatus, or paymentMethod) must be provided',
    path: [],
});
// Driver Booking
exports.DriverBookingSchema = zod_1.z.object({
    driverId: zod_1.z.number().int().positive({
        message: 'Driver ID must be a positive integer',
    }),
    customerId: zod_1.z.number().int().positive({
        message: 'Customer ID must be a positive integer',
    }),
    pickupDate: zod_1.z.string().datetime().transform((val) => new Date(val)),
    returnDate: zod_1.z.string().datetime().transform((val) => new Date(val)),
    address: zod_1.z.string().optional(),
    status: exports.OrderStatusEnum.default('Upcoming'),
    paymentStatus: exports.PaymentStatusEnum.default('Pending'),
    paymentMethod: exports.PaymentMethodEnum.default('Cash'),
}).refine((data) => data.returnDate >= data.pickupDate, {
    message: 'Return date must be after or equal to pickup date',
    path: ['returnDate'],
}).refine((data) => data.pickupDate > new Date(), {
    message: 'Pickup date must be in the future',
    path: ['pickupDate'],
});
exports.GetAllDriverBookingsFilterSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(10),
    driverId: zod_1.z.coerce.number().int().positive().optional(),
    customerId: zod_1.z.coerce.number().int().positive().optional(),
    status: exports.OrderStatusEnum.optional(),
    paymentStatus: exports.PaymentStatusEnum.optional(),
    search: zod_1.z.string().optional(),
});
exports.ProcessDriverBookingSchema = zod_1.z.object({
    status: exports.OrderStatusEnum.optional(),
    paymentStatus: exports.PaymentStatusEnum.optional(),
    paymentMethod: exports.PaymentMethodEnum.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (status, paymentStatus, or paymentMethod) must be provided',
    path: [],
});
