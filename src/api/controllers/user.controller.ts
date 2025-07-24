import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import { statusCode } from "../types/types";
import { ErrorResponse, jwt, OTP } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { z } from "zod";
import { prisma } from "../../config";
import { LoginValidator, OtpValidator } from "../validators/user.validator";

export const requestOtp = asyncHandler(async (req: Request, res: Response) => {
  const validData = OtpValidator.parse(req.body);
  const otp = OTP.generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const existingOtp = await prisma.otp.findFirst({
    where: { mobile: validData.mobile },
  });
  if (existingOtp) {
    await prisma.otp.delete({ where: { id: existingOtp.id } });
  }

  await prisma.otp.create({
    data: { mobile: validData.mobile, otp, expiresAt },
  });

  await OTP.sendOtp(validData.mobile, otp);

  return SuccessResponse(
    res,
    "OTP sent successfully",
    { mobile: validData.mobile },
    statusCode.OK
  );
});

export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const validData = LoginValidator.parse(req.body);

  const storedOtp = await prisma.otp.findFirst({
    where: {
      mobile: validData.mobile,
      otp: validData.otp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!storedOtp) {
    throw new ErrorResponse("Invalid or expired OTP", statusCode.Bad_Request);
  }

  let user = await prisma.user.findUnique({
    where: { mobile: validData.mobile },
  });
  if (!user) {
    user = await prisma.user.create({
      data: { mobile: validData.mobile, name: "New User" },
    });
  }

  const token = jwt.generateToken({
    id: user.id,
  });

  await prisma.otp.delete({ where: { id: storedOtp.id } });

  return SuccessResponse(
    res,
    "Login successful",
    { token, user: { id: user.id, mobile: user.mobile, role: "user" } },
    statusCode.OK
  );
});
