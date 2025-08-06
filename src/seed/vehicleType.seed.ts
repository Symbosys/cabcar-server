import { prisma } from "../config";

// Seed VehicleType table
const seedVehicleTypes = async () => {
  const vehicleTypes = [
    { name: "Sedan" },
    { name: "SUV" },
    { name: "Hatchback" },
    { name: "Van" },
    { name: "Convertible" },
  ];

  await prisma.vehicleType.createMany({
    data: vehicleTypes,
    skipDuplicates: true,
  });

  console.log("Seeded 5 VehicleType records.");
};

export default seedVehicleTypes