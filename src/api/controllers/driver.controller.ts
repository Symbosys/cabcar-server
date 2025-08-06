import { prisma, uploadToCloudinary } from "../../config";
import cloudinary from "../../config/cloudinary";
import { asyncHandler } from "../middlewares";
import { ImageType, statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { DriverSchema, GetAllDriversQuerySchema } from "../validators/driver.validator";

export const createDriver = asyncHandler(async (req, res, next) => {
    const data = DriverSchema.parse(req.body)

    const { licenseNumber } = data;
    const image = req.file as Express.Multer.File | undefined;
    
    // Check for duplicate licenseNumber
  const existingDriver = await prisma.driver.findUnique({
    where: { licenseNumber },
  });
  if (existingDriver) {
    return next(new ErrorResponse("License number already exists", statusCode.Bad_Request));
    }
    
    // Handle image upload to Cloudinary if provided
  let imageToCloudinary: ImageType | undefined;
  if (image) {
    try {
      const cloudinaryResult = await uploadToCloudinary(image.buffer, "cab-car/driver");
      imageToCloudinary = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      };
    } catch (error) {
      return next(new ErrorResponse("Failed to upload image to Cloudinary", statusCode.Internal_Server_Error));
    }
    }
    
    // Create driver with Prisma
  const driver = await prisma.driver.create({
    data: {
      ...data,
      image: imageToCloudinary ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url } : {},
    },
  });
    
    return SuccessResponse(res, "Driver created successfully", driver, statusCode.Created);
})

export const getAllDriver = asyncHandler(async (req, res, next) => {
    const query = GetAllDriversQuerySchema.parse(req.query);

    const {
    page,
    limit,
    available,
    isActive,
    experienceYearsMin,
    experienceYearsMax,
    search,
    } = query;
    
    // Build Prisma where clause
  const where: any = {};

  if (available !== undefined) where.available = available;
  if (isActive !== undefined) where.isActive = isActive;
  if (experienceYearsMin !== undefined) where.experienceYears = { gte: experienceYearsMin };
  if (experienceYearsMax !== undefined)
    where.experienceYears = { ...where.experienceYears, lte: experienceYearsMax };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { licenseNumber: { contains: search} },
      { location: { contains: search} },
    ];
    }
    
    // Calculate pagination
  const skip = (page - 1) * limit;
  const totalDrivers = await prisma.driver.count({ where });
    const totalPages = Math.ceil(totalDrivers / limit);
    
    // Fetch drivers
  const drivers = await prisma.driver.findMany({
    where,
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      licenseNumber: true,
      location: true,
      experienceYears: true,
      image: true,
      available: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
    
    return SuccessResponse(res, "rivers retrieved successfully", {
        drivers,
        totalDrivers,
        totalPages,
        currentPage: page,
        count: drivers.length
    })
})

export const getDriverById = asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));
    }
    
    const driver = await prisma.driver.findUnique({
        where: { id },
    })

    if (!driver) {
    return next(
      new ErrorResponse(`Driver with ID ${id} not found`, statusCode.Not_Found)
    );
    }
    
    return SuccessResponse(res, "Driver retrieved successfully", driver, statusCode.OK);
})

export const updateDriver = asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid ID", statusCode.Bad_Request));

    const validData = DriverSchema.partial().parse(req.body);
  const image = req.file as Express.Multer.File | undefined;

    // Check if driver exists
  const existingDriver = await prisma.driver.findUnique({
    where: { id },
  });
  if (!existingDriver) {
    return next(
      new ErrorResponse(`Driver with ID ${id} not found`, statusCode.Not_Found)
    );
  }

    // check for duplicate licenseNumber
  if (validData.licenseNumber) {
    const existingLicenseNumber = await prisma.driver.findFirst({
      where: {
        licenseNumber: validData.licenseNumber,
        NOT: { id },
      },
    });
    if (existingLicenseNumber) {
      return next(new ErrorResponse("License number already exists", statusCode.Bad_Request));
    }
  }

    // Handle image upload to Cloudinary if provided
    let imageToCloudinary: ImageType | undefined;
    let oldImagePublicId;
    if (image) {
        if (existingDriver.image && (existingDriver.image as unknown as ImageType).public_id) {
            // extract the public id of old image
            const existingImage = existingDriver.image as unknown as ImageType;
            oldImagePublicId = existingImage.public_id;
            const deleteFromCloudinary = await cloudinary.uploader.destroy(oldImagePublicId);
            if (deleteFromCloudinary.result !== "ok") {
                return next(new ErrorResponse("Failed to delete old image from Cloudinary", statusCode.Internal_Server_Error));
            }

            // upload the New image
            const cloudinaryResult = await uploadToCloudinary(image.buffer, "cab-car/driver");
            imageToCloudinary = {
                public_id: cloudinaryResult.public_id,
                url: cloudinaryResult.secure_url,
            };
      }
    }

    // Prepare upadate data

    const upadateData: any = {
        ...validData,
        image: imageToCloudinary ? { public_id: imageToCloudinary.public_id, url: imageToCloudinary.url } : {},
    };

    // Update driver with Prisma
    const driver = await prisma.driver.update({
        where: { id },
        data: upadateData,
    });
    return SuccessResponse(res, "Driver updated successfully", driver, statusCode.OK);
    
})