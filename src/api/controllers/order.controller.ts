import { prisma } from "../../config";
import { asyncHandler } from "../middlewares";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { BookingSchema, GetAllBookingsFilterSchema, ProcessBookingSchema } from "../validators/order.validator";

export const createBooking = asyncHandler(async(req, res, next) => {
    const validData = BookingSchema.parse(req.body);

    // Additional business logic validations
  // 1. Check if pickup date is in the future
  const currentDate = new Date();
  if (validData.pickupDate <= currentDate) {
    return next(
      new ErrorResponse('Pickup date must be in the future', statusCode.Bad_Request)
    );
  }

  // 2. Check if return date is after pickup date
  if (validData.returnDate <= validData.pickupDate) {
    return next(
      new ErrorResponse('Return date must be after pickup date', statusCode.Bad_Request)
    );
  }

  // 3. Check if vehicle exists
  const vehicle = await prisma.car.findUnique({
    where: { id: validData.vehicleId },
  });

  if (!vehicle) {
    return next(
      new ErrorResponse('Vehicle not found', statusCode.Bad_Request)
    );
  }


  // 4. Check vehicle availability for the requested period
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      vehicleId: validData.vehicleId,
      OR: [
        {
          pickupDate: { lte: validData.returnDate },
          returnDate: { gte: validData.pickupDate },
        },
      ],
      status: { in: ['Upcoming', 'Ongoing'] },
    },
  });

  if (conflictingBooking) {
    return next(
      new ErrorResponse('Vehicle is not available for the selected dates', statusCode.Conflict)
    );
  }

  // 5. Check if customer exists
  const customer = await prisma.user.findUnique({
    where: { id: validData.customerId },
  });

  if (!customer) {
    return next(
      new ErrorResponse('User not found', statusCode.Bad_Request)
    );
  }

  const booking = await prisma.booking.create({
    data: validData,
  });

  return res.status(statusCode.Created).json({
    success: true,
    message: 'Booking created successfully',
    data: booking,
  });

});


export const getAllBooking = asyncHandler(async(req, res, next) => {
    const filters = GetAllBookingsFilterSchema.parse(req.query);

    const {
        page,
        limit,
        vehicleId,
        customerId,
        status,
        paymentStatus,
        search,
      } = filters;
    
      const where: any = {};

      // Search filter for customer email or vehicle details
  if (search) {
    where.OR = [
      {
        customer: {
          email: { contains: search},
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

      if (vehicleId !== undefined) where.vehicleId = vehicleId;
      if (customerId !== undefined) where.customerId = customerId;
      if (status !== undefined) where.status = status;
      if (paymentStatus !== undefined) where.paymentStatus = paymentStatus;

      const skip = (page - 1) * limit;

      const [bookings, totalBookings] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where }),
      ]);

      return SuccessResponse(res, "All Bookings Retrived successfully", {
        bookings,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
    count: bookings.length,
      });

})

export const getBookingById = asyncHandler(async(req, res, next) => {
    const id = Number(req.params.id);
    if(!id || isNaN(id))
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));
    const booking = await prisma.booking.findUnique({
        where: { id },
    });
    if(!booking)
    return next(new ErrorResponse(`Booking with ID ${id} not found`, statusCode.Not_Found));
    return SuccessResponse(res, "Booking Retrived successfully", booking, statusCode.OK);
})


export const processOrder = asyncHandler(async(req, res, next) => {
    const id = Number(req.params.id);
    const data = ProcessBookingSchema.parse(req.body)
    if(!id)
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));
    const booking = await prisma.booking.findUnique({
        where: { id },
    });
    if(!booking) return next(new ErrorResponse(`Booking with ID ${id} not found`, statusCode.Not_Found));
    const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
            status: data.status,
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod
        },
    });
    
    return SuccessResponse(res, "Booking Retrived successfully", updatedBooking, statusCode.OK);
})