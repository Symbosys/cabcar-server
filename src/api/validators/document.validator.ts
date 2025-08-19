import z from "zod";

export const VerifyUserIdentitySchema = z
  .object({
    userId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: "User ID must be a positive integer",
      }).optional(),
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, { message: "Aadhaar number must be exactly 12 digits" })
      .optional(),
    drivingLicenseNumber: z
      .string()
      .optional(),
  })
  .strict()
  .refine((data) => data.aadhaarNumber || data.drivingLicenseNumber, {
    message: "At least one of Aadhaar number or driving license number must be provided",
    path: ["aadhaarNumber", "drivingLicenseNumber"],
  });