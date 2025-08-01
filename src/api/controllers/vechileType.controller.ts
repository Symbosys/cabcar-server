import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { z } from "zod";
import { prisma } from "../../config";

const VehicleTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const QuerySchema = z.object({
  search: z.string().optional(),
  sort: z.string().default("id:asc"),
});

export const getVehicleTypes = asyncHandler(async (req: Request, res: Response) => {

  const vehicleTypes = await prisma.vehicleType.findMany()

  return SuccessResponse(
    res,
    "Vehicle types fetched successfully",
    { vehicleTypes },
    statusCode.OK
  );
});

export const getVehicleTypeById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || !id) {
    throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
  }

  const vehicleType = await prisma.vehicleType.findUnique({
    where: { id },
  });

  if (!vehicleType) {
    throw new ErrorResponse("Vehicle type not found", statusCode.Not_Found);
  }

  return SuccessResponse(
    res,
    "Vehicle type fetched successfully",
    vehicleType,
    statusCode.OK
  );
});

export const createVehicleType = asyncHandler(async (req: Request, res: Response) => {
  const validData = VehicleTypeSchema.parse(req.body);

  const vehicleType = await prisma.vehicleType.create({
    data: validData,
  });

  return SuccessResponse(
    res,
    "Vehicle type created successfully",
    vehicleType,
    statusCode.Created
  );
});

export const updateVehicleType = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || !id) {
    throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
  }

  const validData = VehicleTypeSchema.parse(req.body);

  const vehicleType = await prisma.vehicleType.update({
    where: { id },
    data: validData,
  });

  return SuccessResponse(
    res,
    "Vehicle type updated successfully",
    vehicleType,
    statusCode.OK
  );
});

export const deleteVehicleType = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || !id) {
    throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
  }

  const vehicleType = await prisma.vehicleType.findUnique({ where: { id } });
  if (!vehicleType) {
    throw new ErrorResponse("Vehicle type not found", statusCode.Not_Found);
  }

  await prisma.vehicleType.delete({ where: { id } });

  return SuccessResponse(
    res,
    "Vehicle type deleted successfully",
    null,
    statusCode.No_Content
  );
});