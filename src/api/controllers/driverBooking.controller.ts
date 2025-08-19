import { prisma } from "../../config";
import { asyncHandler } from "../middlewares";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { DriverBookingSchema, GetAllDriverBookingsFilterSchema, ProcessDriverBookingSchema } from "../validators/order.validator";

export const createDriverBooking = asyncHandler(async (req, res, next) => {
    const validData = DriverBookingSchema.parse(req.body);

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id: validData.driverId },
    });

    if (!driver) {
      return next(
        new ErrorResponse('Driver not found', statusCode.Bad_Request)
      );
    }

    const conflictingDriverBooking = await prisma.driverBooking.findFirst({
      where: {
        driverId: validData.driverId,
        OR: [
          {
            pickupDate: { lte: validData.returnDate },
            returnDate: { gte: validData.pickupDate },
          },
        ],
        status: { in: ['Upcoming', 'Ongoing'] },
      },
    });

    if (conflictingDriverBooking) {
      return next(
        new ErrorResponse('Driver is not available for the selected dates', statusCode.Conflict)
      );
    }

    const driverBooking = await prisma.driverBooking.create({
      data: validData,
    });

    return SuccessResponse(res, "Driver booking created successfully", driverBooking, statusCode.Created);
})

export const getDriverBooking = asyncHandler(async (req, res, next) => {
    const filters = GetAllDriverBookingsFilterSchema.parse(req.query);

    const {
      page,
      limit,
      driverId,
      status,
        paymentStatus,
      customerId,
      search,
    } = filters;
    const where: any = {};

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

    if (driverId !== undefined) where.driverId = driverId;
    if (customerId !== undefined) where.customerId = customerId;
    if (status !== undefined) where.status = status;
    if (paymentStatus !== undefined) where.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    
    const [driverBookings, totalDriverBookings] = await Promise.all([
      prisma.driverBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driverBooking.count({ where }),
    ]);

    return SuccessResponse(res, "Driver bookings fetched successfully", {
        driverBookings,
        totalDriverBookings,
        currentPage: page,
        totalPages: Math.ceil(totalDriverBookings / limit),
        count: driverBookings.length,
    })
})

export const getDriverBookingById = asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    
    if (isNaN(id) || !id) {
      return next(
        new ErrorResponse('Invalid driver booking ID', statusCode.Bad_Request)
      );
    }

    const driverBooking = await prisma.driverBooking.findUnique({
      where: { id },
    });

    if (!driverBooking) {
      return next(
        new ErrorResponse('Driver booking not found', statusCode.Bad_Request)
      );
    }

    return SuccessResponse(res, "Driver booking fetched successfully", driverBooking)
})

export const processDriverBooking = asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        return next(new ErrorResponse('Invalid driver booking ID', statusCode.Bad_Request))
    }
    const validData = ProcessDriverBookingSchema.parse(req.body);

    const existingDriverBooking = await prisma.driverBooking.findUnique({
      where: { id },
    });

    if (!existingDriverBooking) {
      return next(
        new ErrorResponse('Driver booking not found', statusCode.Not_Found)
      );
    }

    const updatedDriverBooking = await prisma.driverBooking.update({
      where: { id },
      data: {
        status: validData.status,
        paymentStatus: validData.paymentStatus,
        paymentMethod: validData.paymentMethod,
      }
    });

    return SuccessResponse(res, "Driver booking updated successfully", updatedDriverBooking)
})
    