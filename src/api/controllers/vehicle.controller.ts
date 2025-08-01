import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../../config/cloudinary";

const prisma = new PrismaClient();

// Type for images field
interface VehicleImages {
  [key: string]: string;
}

// Type guard for VehicleImages
function isVehicleImages(value: unknown): value is VehicleImages {
  return typeof value === 'object' && value !== null && Object.values(value).every(v => typeof v === 'string');
}

// Interface for VehicleImage
interface VehicleImage {
  public_id: string;
  url: string;
}

// Zod schemas
const VehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  number: z.string().min(1, "Number is required"),
  fuel: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  seats: z.number().int().positive("Seats must be a positive integer"),
  location: z.string().min(1, "Location is required"),
  available: z.boolean().default(true),
  pricePerKm: z.number().nonnegative().optional(),
  pricePerDay: z.number().nonnegative().optional(),
  driverCharge: z.number().nonnegative(),
  convenienceFee: z.number().nonnegative().default(0),
  tripProtectionFee: z.number().nonnegative().default(0),
  deposit: z.number().nonnegative(),
  typeId: z.number().int().positive().optional().nullable(),
  images: z.record(z.string(), z.string()).optional(),
});

const UpdateVehicleSchema = VehicleSchema.partial();

const QuerySchema = z.object({
  page: z.string().default("1").transform((val) => parseInt(val)),
  limit: z.string().default("10").transform((val) => parseInt(val)),
  search: z.string().optional(),
  available: z.string().optional(),
  sort: z.string().default("id:asc"),
});

const BookingQuerySchema = z.object({
  vehicleId: z.string().transform((val) => parseInt(val)),
  page: z.string().default("1").transform((val) => parseInt(val)),
  limit: z.string().default("5").transform((val) => parseInt(val)),
});

export const preprocessVehicleData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const data = { ...req.body };

  // Convert numeric fields
  const numericFields = [
    'seats',
    'pricePerKm',
    'pricePerDay',
    'driverCharge',
    'convenienceFee',
    'tripProtectionFee',
    'deposit',
    'typeId',
  ];
  numericFields.forEach(field => {
    if (typeof data[field] === 'string' && data[field].trim() !== '') {
      const value = parseFloat(data[field]);
      if (!isNaN(value)) {
        data[field] = field === 'seats' || field === 'typeId' ? Math.floor(value) : value;
      } else {
        throw new ErrorResponse(`Invalid number for ${field}`, statusCode.Bad_Request);
      }
    } else if (data[field] == null || data[field] === '') {
      data[field] = undefined;
    }
  });

  // Convert boolean field
  if (typeof data.available === 'string') {
    if (data.available.toLowerCase() === 'true') {
      data.available = true;
    } else if (data.available.toLowerCase() === 'false') {
      data.available = false;
    } else {
      throw new ErrorResponse('Invalid boolean for available', statusCode.Bad_Request);
    }
  } else if (data.available == null) {
    data.available = true;
  }

  // Parse images field
  if (typeof data.images === 'string' && data.images.trim() !== '') {
    try {
      data.images = JSON.parse(data.images);
    } catch {
      throw new ErrorResponse('Invalid JSON for images', statusCode.Bad_Request);
    }
  } else if (data.images == null || data.images === '') {
    data.images = {};
  }

  // Validate with Zod schema
  const schema = req.method === 'POST' ? VehicleSchema : UpdateVehicleSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ErrorResponse('Invalid vehicle data', statusCode.Bad_Request);
  }

  req.body = data;
  next();
});

export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, available, sort } = QuerySchema.parse(req.query);

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search} },
      { number: { contains: search} },
    ];
  }
  if (available !== undefined) {
    where.available = available === "true";
  }

  const [sortField, sortOrder] = sort.split(":");
  const orderBy: any = {};
  if (sortField && sortOrder) {
    orderBy[sortField] = sortOrder;
  } else {
    orderBy.id = "asc";
  }

  const [vehicles, total] = await Promise.all([
    prisma.car.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        type: true,
        bookings: {
          include: {
            customer: {
              select: { id: true, name: true, mobile: true },
            },
          },
        },
      },
    }),
    prisma.car.count({ where }),
  ]);

  const vehiclesWithImage = vehicles.map((vehicle: any) => ({
    ...vehicle,
    imageUrl: isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png',
    pricePer10Km: `₹${((vehicle.pricePerKm ?? 0) * 10).toFixed(2)}/10km`,
  }));

  const result = {
    vehicles: vehiclesWithImage,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  return SuccessResponse(res, "Vehicles fetched successfully", result, statusCode.OK);
});

export const getAvailableVehicles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, sort } = QuerySchema.parse(req.query);

  const where: any = { available: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { number: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [sortField, sortOrder] = sort.split(":");
  const orderBy: any = {};
  if (sortField && sortOrder) {
    orderBy[sortField] = sortOrder;
  } else {
    orderBy.id = "asc";
  }

  const [vehicles, total] = await Promise.all([
    prisma.car.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        type: true,
      },
    }),
    prisma.car.count({ where }),
  ]);

  const vehiclesWithImage = vehicles.map((vehicle: any) => ({
    ...vehicle,
    imageUrl: isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png',
    pricePer10Km: `₹${((vehicle.pricePerKm ?? 0) * 10).toFixed(2)}/10km`,
  }));

  const result = {
    vehicles: vehiclesWithImage,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  return SuccessResponse(res, "Available vehicles fetched successfully", result, statusCode.OK);
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || !id) {
    throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
  }

  const vehicle = await prisma.car.findUnique({
    where: { id },
    include: {
      type: true,
      bookings: {
        include: {
          customer: {
            select: { id: true, name: true, mobile: true },
          },
        },
      },
    },
  });

  if (!vehicle) {
    throw new ErrorResponse("Vehicle not found", statusCode.Not_Found);
  }

  const imageUrl = isVehicleImages(vehicle.images) ? vehicle.images.front : '/assets/default-car.png';
  return SuccessResponse(
    res,
    "Vehicle fetched successfully",
    {
      ...vehicle,
      imageUrl,
      pricePer10Km: `₹${((vehicle.pricePerKm ?? 0) * 10).toFixed(2)}/10km`,
    },
    statusCode.OK
  );
});

export const getCarBookings = asyncHandler(async (req: Request, res: Response) => {
  const { vehicleId, page, limit } = BookingQuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { vehicleId },
      skip,
      take: limit,
      orderBy: { pickupDate: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, mobile: true },
        },
      },
    }),
    prisma.booking.count({ where: { vehicleId } }),
  ]);

  const result = {
    bookings: bookings.map((booking: any) => ({
      id: booking.id,
      booked: booking.pickupDate.toISOString(),
      returned: booking.returnDate.toISOString(),
      by: booking.customer.name,
      number: booking.customer.mobile,
      customerId: booking.customer.id,
      status: booking.status,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };

  return SuccessResponse(res, "Bookings fetched successfully", result, statusCode.OK);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const file = req.file as Express.Multer.File;
  const { number, typeId } = data;

  // Check for duplicate vehicle number
  const existingVehicle = await prisma.car.findUnique({ where: { number } });
  if (existingVehicle) {
    throw new ErrorResponse("Vehicle number already exists", statusCode.Bad_Request);
  }

  // Validate vehicle type if provided
  if (typeId != null) {
    const vehicleType = await prisma.vehicleType.findUnique({ where: { id: typeId } });
    if (!vehicleType) {
      throw new ErrorResponse("Invalid vehicle type ID", statusCode.Bad_Request);
    }
  }

  // Handle single image upload to Cloudinary
  let image: VehicleImage | undefined;
  if (!file) {
    throw new ErrorResponse("Image is required", statusCode.Bad_Request);
  }

  const cloudinaryResult = await uploadToCloudinary(file.buffer, "vehicles");
  image = {
    public_id: cloudinaryResult.public_id,
    url: cloudinaryResult.secure_url,
  };

  // Create vehicle
  const vehicle = await prisma.car.create({
    data: {
      name: data.name,
      number: data.number,
      fuel: data.fuel,
      transmission: data.transmission,
      seats: data.seats,
      location: data.location,
      available: data.available,
      pricePerKm: data.pricePerKm,
      pricePerDay: data.pricePerDay,
      driverCharge: data.driverCharge,
      convenienceFee: data.convenienceFee,
      tripProtectionFee: data.tripProtectionFee,
      deposit: data.deposit,
      typeId: typeId ?? null,
      images: image ? { public_id: image.public_id, url: image.url } : {},
    },
  });

  return SuccessResponse(res, "Vehicle created successfully", vehicle, statusCode.Created);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = Number(req.params.id);
  if (isNaN(vehicleId) || !vehicleId) {
    throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
  }

  const data = req.body;
  const files = req.files as Express.Multer.File[];

  // Validate vehicle type if provided
  if (data.typeId != null) {
    const vehicleType = await prisma.vehicleType.findUnique({ where: { id: data.typeId } });
    if (!vehicleType) {
      throw new ErrorResponse("Invalid vehicle type ID", statusCode.Bad_Request);
    }
  }

  // Handle image uploads
  let images: VehicleImages = data.images || {};
  if (files && files.length > 0) {
    for (const file of files) {
      const cloudinaryResult = await uploadToCloudinary(file.buffer, "vehicles");
      const key = file.originalname.split('.')[0] || `image${Object.keys(images).length}`;
      images[key] = cloudinaryResult.secure_url;
    }
  }

  const vehicle = await prisma.car.update({
    where: { id: vehicleId },
    data: {
      ...data,
      typeId: data.typeId ?? null,
      images,
    },
  });

  return SuccessResponse(res, "Vehicle updated successfully", vehicle, statusCode.OK);
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = Number(req.params.id);
  if (isNaN(vehicleId) || !vehicleId) {
    throw new ErrorResponse("Invalid ID", statusCode.Bad_Request);
  }

  const vehicle = await prisma.car.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new ErrorResponse("Vehicle not found", statusCode.Not_Found);
  }

  await prisma.car.delete({ where: { id: vehicleId } });
  return SuccessResponse(res, "Vehicle deleted successfully", null, statusCode.No_Content);
});