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
function seedCar() {
    return __awaiter(this, void 0, void 0, function* () {
        const vehicleTypes = yield config_1.prisma.vehicleType.findMany();
        if (vehicleTypes.length === 0) {
            throw new Error('No VehicleTypes found. Seed some VehicleTypes first.');
        }
        const fixedImage = {
            url: "https://res.cloudinary.com/dv5yymidd/image/upload/v1754288911/cab-car/kqaiuoggsrr0mus7qhyd.jpg",
            public_id: "cab-car/kqaiuoggsrr0mus7qhyd"
        };
        console.log(`Creating 200 cars...`);
        for (let i = 1; i <= 20; i++) {
            const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
            const hasAC = Math.random() > 0.5;
            const isAvailable = Math.random() > 0.2;
            const randomSeats = [4, 5, 7][Math.floor(Math.random() * 3)];
            const randomFuel = ['Petrol', 'Diesel', 'Electric'][Math.floor(Math.random() * 3)];
            const randomTransmission = ['Manual', 'Automatic'][Math.floor(Math.random() * 2)];
            const randomLocation = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Miami'][Math.floor(Math.random() * 5)];
            yield config_1.prisma.car.create({
                data: {
                    name: `Car Model ${i}`,
                    number: `CAR-${1000 + i}`,
                    type: {
                        connect: { id: randomType.id },
                    },
                    fuel: randomFuel,
                    transmission: randomTransmission,
                    ac: hasAC,
                    seats: randomSeats,
                    available: isAvailable,
                    location: randomLocation,
                    latitude: 37 + Math.random(),
                    longitude: -122 + Math.random(),
                    features: 'GPS, Bluetooth, Airbags',
                    benefits: '24/7 support, Free cancellation',
                    cancellationPolicy: 'Full refund if cancelled 24h before pickup.',
                    pricePerKm: parseFloat((0.5 + Math.random() * 1.5).toFixed(2)),
                    pricePerDay: parseFloat((20 + Math.random() * 80).toFixed(2)),
                    driverCharge: parseFloat((15 + Math.random() * 25).toFixed(2)),
                    convenienceFee: parseFloat((2 + Math.random() * 3).toFixed(2)),
                    tripProtectionFee: parseFloat((3 + Math.random() * 5).toFixed(2)),
                    deposit: parseFloat((100 + Math.random() * 200).toFixed(2)),
                    images: fixedImage,
                    bookings: {
                        create: [],
                    },
                    locations: {
                        create: [],
                    },
                },
            });
        }
        console.log('Seeding completed.');
    });
}
exports.default = seedCar;
