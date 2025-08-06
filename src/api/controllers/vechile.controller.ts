import { prisma, uploadToCloudinary } from "../../config";
import cloudinary from "../../config/cloudinary";
import { asyncHandler } from "../middlewares";
import { ImageType, statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import {
  CarSchema,
  GetAllVehiclesFilterSchema,
} from "../validators/car.validator";


export const createCar = asyncHandler(async (req, res, next) => {
  const ValidData = CarSchema.parse(req.body);
  const image = req.file as Express.Multer.File;

  if (!image)
    return next(new ErrorResponse("Image is required", statusCode.Bad_Request));

  const existingVehicle = await prisma.car.findUnique({
    where: {
      number: ValidData.number,
    },
  });

  if (existingVehicle)
    return next(
      new ErrorResponse("Vehicle number already exists", statusCode.Bad_Request)
    );

  if (ValidData.typeId != null) {
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: ValidData.typeId },
    });
    if (!vehicleType) {
      return next(
        new ErrorResponse("Invalid vehicle type ID", statusCode.Bad_Request)
      );
    }
  }

  let imageToCloudinary: ImageType | undefined;
  const cloudinaryResult = await uploadToCloudinary(image.buffer, "cab-car");
  imageToCloudinary = {
    public_id: cloudinaryResult.public_id,
    url: cloudinaryResult.secure_url,
  };

  const vehicle = await prisma.car.create({
    data: {
      ...ValidData,
      typeId: ValidData.typeId ?? null,
      images: imageToCloudinary
        ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url }
        : {},
    },
  });

  return res.status(statusCode.Created).json({
    success: true,
    message: "Vehicle created successfully",
    data: vehicle,
  });
});

export const getALlCar = asyncHandler(async (req, res, next) => {
  const filters = GetAllVehiclesFilterSchema.parse(req.query);

  const {
    page,
    limit,
    typeId,
    ac,
    seats,
    available,
    pricePerKmMax,
    pricePerDayMax,
    driverChargeMax,
    sortBy,
    sortOrder,
    search,
  } = filters;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { number: { contains: search } },
    ];
  }

  if (typeId !== undefined) where.typeId = typeId;
  if (ac !== undefined) where.ac = ac;
  if (seats !== undefined) where.seats = seats;
  if (available !== undefined) where.available = available;

  if (pricePerKmMax !== undefined) {
    where.pricePerKm = { gte: 0, lte: pricePerKmMax };
  }
  if (pricePerDayMax !== undefined) {
    where.pricePerDay = { gte: 0, lte: pricePerDayMax };
  }
  if (driverChargeMax !== undefined) {
    where.driverCharge = { gte: 0, lte: driverChargeMax };
  }

  const skip = (page - 1) * limit;

  const [cars, totalCar] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        type: true, // Include related VehicleType
      },
    }),
    prisma.car.count({ where }),
  ]);

  return SuccessResponse(res, "Vehicles retrieved successfully", {
    cars,
    totalCar,
    totalPage: Math.ceil(totalCar / limit),
    currentPage: page,
    count: cars.length,
  });
});

export const getCarByID = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));
  }

  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      type: true, // Include related VehicleType
    },
  });

  if (!car) {
    return next(
      new ErrorResponse(`Car with ID ${id} not found`, statusCode.Not_Found)
    );
  }

  return SuccessResponse(res, "Car retrieved successfully", car, statusCode.OK);
});

export const updateCar = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));

  const validData = CarSchema.partial().parse(req.body);
  const image = req.file as Express.Multer.File | undefined;

  // Check if car exists
  const existingCar = await prisma.car.findUnique({
    where: { id },
  });
  if (!existingCar) {
    return next(
      new ErrorResponse(`Car with ID ${id} not found`, statusCode.Not_Found)
    );
  }

  // Check for duplicate vehicle number (if number is being updated)
  if (validData.number && validData.number !== existingCar.number) {
    const duplicateVehicle = await prisma.car.findUnique({
      where: { number: validData.number },
    });
    if (duplicateVehicle) {
      return next(
        new ErrorResponse(
          "Vehicle number already exists",
          statusCode.Bad_Request
        )
      );
    }
  }

  // Validate vehicle type if provided
  if (validData.typeId !== undefined && validData.typeId !== null) {
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: validData.typeId },
    });
    if (!vehicleType) {
      return next(
        new ErrorResponse("Invalid vehicle type ID", statusCode.Bad_Request)
      );
    }
  }

  let imageToCloudinary: ImageType | undefined;
  let oldImagePublicId;
  // if image is provided
  if (image) {
    // Delete Image from cloudinary
    if (
      existingCar.images &&
      (existingCar.images as unknown as ImageType).public_id
    ) {
      // extract the public id of old image
      const existingImage = existingCar.images as unknown as ImageType;
      oldImagePublicId = existingImage.public_id;
      const deleteFromCloudinary = await cloudinary.uploader.destroy(
        oldImagePublicId
      );
      if (deleteFromCloudinary?.result !== "ok") {
        return next(
          new ErrorResponse(
            "Failed to delete old image from Cloudinary",
            statusCode.Internal_Server_Error
          )
        );
      }

      // upload the New imamge
      const cloudinaryResult = await uploadToCloudinary(image.buffer, "cab-car");
      imageToCloudinary = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      };
    }
  }

  // Prepare update data
  const updateData: any = {
    ...validData,
    typeId: validData.typeId ?? existingCar.typeId,
    features: validData.features ?? existingCar.features,
    benefits: validData.benefits ?? existingCar.benefits,
    images: imageToCloudinary ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url } : existingCar.images,
  };

  // Update car
  const updatedCar = await prisma.car.update({
    where: { id },
    data: updateData,
    include: {
      type: true, // Include related VehicleType
    },
  });

  return SuccessResponse(res, "Car updated successfully", updatedCar, statusCode.OK);
});
