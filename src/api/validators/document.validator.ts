import z from "zod";

export const VerifyUserIdentitySchema = z
  .object({
    userId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: "User ID must be a positive integer",
      }),
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, { message: "Aadhaar number must be exactly 12 digits" })
      .optional(),
    drivingLicenseNumber: z
      .string()
      .min(8, { message: "Driving license number must be at least 8 characters" })
      .max(16, { message: "Driving license number must be 16 characters or less" })
      .regex(/^[A-Z0-9-]+$/, {
        message: "Driving license number must contain only uppercase letters, numbers, or hyphens",
      })
      .optional(),
  })
  .strict()
  .refine((data) => data.aadhaarNumber || data.drivingLicenseNumber, {
    message: "At least one of Aadhaar number or driving license number must be provided",
    path: ["aadhaarNumber", "drivingLicenseNumber"],
  });