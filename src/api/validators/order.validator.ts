import { z } from 'zod';

export const OrderStatusEnum = z.enum(['Upcoming', 'Ongoing', 'Completed']);
export const PaymentStatusEnum = z.enum(['Pending', 'Paid', 'Failed', 'Refunded']);
export const PaymentMethodEnum = z.enum(['Cash', 'Razapay']);

export const BookingSchema = z.object({
  vehicleId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  pickupDate: z.string().datetime().transform((val) => new Date(val)),
  returnDate: z.string().datetime().transform((val) => new Date(val)),
  amount: z.number().positive(),
  driver: z.boolean().default(false),
  status: OrderStatusEnum.default('Upcoming'),
  paymentStatus: PaymentStatusEnum.default('Pending'),
  paymentMethod: PaymentMethodEnum.default('Cash'),
});

export type Booking = z.infer<typeof BookingSchema>;




// Zod schema for query filters
export const GetAllBookingsFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  vehicleId: z.coerce.number().int().positive().optional(),
  customerId: z.coerce.number().int().positive().optional(),
  status: OrderStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  search: z.string().optional(),
});




export const ProcessBookingSchema = z.object({
  status: OrderStatusEnum.optional(),
  paymentStatus: PaymentStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field (status, paymentStatus, or paymentMethod) must be provided',
    path: [],
  }
);