import { z } from "zod";

// Define reusable schemas for common types
const JsonSchema = z.record(z.string(), z.unknown()).optional().describe("JSON object for flexible key-value pairs");
const PositiveNumberSchema = z.number().min(0, { message: "Value must be non-negative" });
const OptionalPositiveNumberSchema = PositiveNumberSchema.optional();

// Main Car schema
export const CarSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(255, { message: "Name must be 255 characters or less" })
    .trim(),
  number: z
    .string()
    .min(1, { message: "Vehicle number is required" })
    .max(50, { message: "Vehicle number must be 50 characters or less" })
    .regex(/^[A-Z0-9-]+$/, { message: "Vehicle number must contain only uppercase letters, numbers, or hyphens" }),
  typeId: z
    .number()
    .int({ message: "Type ID must be an integer" })
    .positive({ message: "Type ID must be positive" })
    .optional()
    .describe("Reference to VehicleType ID"),
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
  ac: z.boolean().default(false).describe("Air conditioning availability"),
  seats: z
    .number()
    .int({ message: "Seats must be an integer" })
    .min(1, { message: "Must have at least 1 seat" })
    .max(50, { message: "Seats must be 50 or fewer" }),
  available: z.boolean().default(true).describe("Vehicle availability status"),
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
  features: JsonSchema.describe("Additional vehicle features in JSON format"),
  benefits: JsonSchema.describe("Additional vehicle benefits in JSON format"),
  cancellationPolicy: z
    .string()
    .max(1000, { message: "Cancellation policy must be 1000 characters or less" })
    .optional()
    .describe("Cancellation policy details"),
  pricePerKm: OptionalPositiveNumberSchema.default(0).describe("Price per kilometer"),
  pricePerDay: OptionalPositiveNumberSchema.default(0).describe("Price per day"),
  driverCharge: PositiveNumberSchema.describe("Driver charge amount"),
  convenienceFee: OptionalPositiveNumberSchema.default(0).describe("Convenience fee"),
  tripProtectionFee: OptionalPositiveNumberSchema.default(0).describe("Trip protection fee"),
  deposit: OptionalPositiveNumberSchema.describe("Deposit amount"),
  images: z
    .record(z.string(), z.unknown())
    .describe("JSON object containing image data or references"),
}).strict();

// TypeScript type inference
export type Car = z.infer<typeof CarSchema>;