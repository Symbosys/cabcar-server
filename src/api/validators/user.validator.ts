import z from "zod"

export const OtpValidator = z.object({
  mobile: z.string().regex(/^\+?\d{10,15}$/, "Invalid mobile number"),
});

export const LoginValidator = z.object({
  mobile: z.string().regex(/^\+?\d{10,15}$/, "Invalid mobile number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});