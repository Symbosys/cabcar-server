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
const config_1 = require("../config");
// Seed VehicleType table
const seedVehicleTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    const vehicleTypes = [
        { name: "Sedan" },
        { name: "SUV" },
        { name: "Hatchback" },
        { name: "Van" },
        { name: "Convertible" },
    ];
    yield config_1.prisma.vehicleType.createMany({
        data: vehicleTypes,
        skipDuplicates: true,
    });
    console.log("Seeded 5 VehicleType records.");
});
exports.default = seedVehicleTypes;
