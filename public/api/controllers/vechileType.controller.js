"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicleType = exports.updateVehicleType = exports.createVehicleType = exports.getVehicleTypeById = exports.getVehicleTypes = void 0;
const middlewares_1 = require("../middlewares");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const zod_1 = require("zod");
const config_1 = require("../../config");
const VehicleTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
});
const QuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    sort: zod_1.z.string().default("id:asc"),
});
exports.getVehicleTypes = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, sort } = QuerySchema.parse(req.query);
    const where = {};
    if (search) {
        where.name = { contains: search, mode: "insensitive" };
    }
    const [sortField, sortOrder] = sort.split(":");
    const orderBy = {};
    if (sortField && sortOrder) {
        orderBy[sortField] = sortOrder;
    }
    else {
        orderBy.id = "asc";
    }
    const vehicleTypes = yield config_1.prisma.vehicleType.findMany({
        where,
        orderBy,
    });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle types fetched successfully", { vehicleTypes }, types_1.statusCode.OK);
}));
exports.getVehicleTypeById = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        throw new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request);
    }
    const vehicleType = yield config_1.prisma.vehicleType.findUnique({
        where: { id },
    });
    if (!vehicleType) {
        throw new utils_1.ErrorResponse("Vehicle type not found", types_1.statusCode.Not_Found);
    }
    return (0, response_util_1.SuccessResponse)(res, "Vehicle type fetched successfully", vehicleType, types_1.statusCode.OK);
}));
exports.createVehicleType = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validData = VehicleTypeSchema.parse(req.body);
    const vehicleType = yield config_1.prisma.vehicleType.create({
        data: validData,
    });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle type created successfully", vehicleType, types_1.statusCode.Created);
}));
exports.updateVehicleType = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        throw new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request);
    }
    const validData = VehicleTypeSchema.parse(req.body);
    const vehicleType = yield config_1.prisma.vehicleType.update({
        where: { id },
        data: validData,
    });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle type updated successfully", vehicleType, types_1.statusCode.OK);
}));
exports.deleteVehicleType = (0, middlewares_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id) || !id) {
        throw new utils_1.ErrorResponse("Invalid ID", types_1.statusCode.Bad_Request);
    }
    const vehicleType = yield config_1.prisma.vehicleType.findUnique({ where: { id } });
    if (!vehicleType) {
        throw new utils_1.ErrorResponse("Vehicle type not found", types_1.statusCode.Not_Found);
    }
    yield config_1.prisma.vehicleType.delete({ where: { id } });
    return (0, response_util_1.SuccessResponse)(res, "Vehicle type deleted successfully", null, types_1.statusCode.No_Content);
}));
