import { z } from "zod";

// Define reusable schemas for common types
const JsonSchema = z.record(z.string(), z.unknown()).optional().describe("JSON object for flexible key-value pairs");
const PositiveNumberSchema = z.number().min(0, { message: "Value must be non-negative" });
const OptionalPositiveNumberSchema = PositiveNumberSchema.optional();

// Main Car schema
export const CarSchema = z.object({
  name: z
    .string("Name is required")
    .min(1, { message: "Name is required" })
    .max(255, { message: "Name must be 255 characters or less" })
    .trim().nonoptional("Name is required"),
  number: z
    .string("Number is required")
    .min(1, { message: "Vehicle number is required" })
    .max(50, { message: "Vehicle number must be 50 characters or less" })
    .regex(/^[A-Z0-9-]+$/, { message: "Vehicle number must contain only uppercase letters, numbers, or hyphens" }).nonempty("number is required"),
   typeId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || val > 0, { message: "Type ID must be a positive integer" })
    .optional(),
  fuel: z
    .string()
    .max(50, { message: "Fuel type must be 50 characters or less" })
    .optional()
    .describe("Fuel type (e.g., Petrol, Diesel, Electric)"),
  transmission: z
    .string()
    .max(50, { message: "Transmission type must be 50 characters or less" })
    .optional()
    .describe("Transmission type (e.g., Manual, Automatic)"),
   ac: z
    .string()
    .transform((val) => val === "true" || val === "false" ? val === "true" : undefined)
    .refine((val) => val !== undefined, { message: "AC must be a boolean (true or false)" })
    .default(false),
  seats: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => Number.isInteger(val) && val >= 1 && val <= 50, {
      message: "Seats must be an integer between 1 and 50",
    }),
  available: z
    .string()
    .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
    .refine((val) => val !== undefined, { message: "Available must be a boolean (true or false)" })
    .default(true),
  location: z
    .string()
    .max(255, { message: "Location must be 255 characters or less" })
    .optional()
    .describe("Vehicle location description"),
  latitude: z
    .number()
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" })
    .optional()
    .describe("Geographic latitude"),
  longitude: z
    .number()
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" })
    .optional()
    .describe("Geographic longitude"),
  features: z.string().describe("Additional vehicle features in JSON format").optional(),
  benefits: z.string().describe("Additional vehicle benefits in JSON format").optional(),
  cancellationPolicy: z
    .string()
    .max(1000, { message: "Cancellation policy must be 1000 characters or less" })
    .optional()
    .describe("Cancellation policy details"),
  pricePerKm: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: "Price per km cannot be negative" })
    .default(0),
  pricePerDay: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: "Price per day cannot be negative" })
    .default(0),
  driverCharge: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: "Driver charge cannot be negative" }),
  convenienceFee: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: "Convenience fee cannot be negative" })
    .default(0),
  tripProtectionFee: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: "Trip protection fee cannot be negative" })
    .default(0),
  deposit: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, { message: "Deposit cannot be negative" })
    .optional()
    .nullable(),
}).strict();

// TypeScript type inference
export type CarType = z.infer<typeof CarSchema>;




export const GetAllVehiclesFilterSchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be a positive integer" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0, { message: "Limit must be a positive integer" }),

  // Filters for specified fields
  typeId: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || val > 0, { message: "Type ID must be a positive integer" })
    .optional(),
  ac: z
    .string()
    .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
    .optional(),
  seats: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (val >= 1 && val <= 50), { message: "Seats must be between 1 and 50" })
    .optional(),
  available: z
    .string()
    .transform((val) => (val === "true" || val === "false" ? val === "true" : undefined))
    .optional(),
  pricePerKmMax: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, { message: "Price per km max must be non-negative" })
    .optional(),
  pricePerDayMax: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, { message: "Price per day max must be non-negative" })
    .optional(),
  driverChargeMax: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, { message: "Driver charge max must be non-negative" })
    .optional(),

  // Sorting
  sortBy: z
    .enum(["seats", "pricePerKm", "pricePerDay", "driverCharge", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),

  // Text search
  search: z.string().max(255).optional().describe("Search term for name, number, or location"),
}).strict();

// TypeScript type inference
type GetAllVehiclesFilters = z.infer<typeof GetAllVehiclesFilterSchema>;
