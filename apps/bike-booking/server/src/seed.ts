import "dotenv/config";
import mongoose from "mongoose";
import { Bike } from "./db/models";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bike-booking";

const bikesData = [
  {
    name: "Mountain Explorer",
    type: "mountain",
    description: "Perfect for trail adventures and rough terrain",
    pricePerHour: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400&h=300&fit=crop",
  },
  {
    name: "City Cruiser",
    type: "city",
    description: "Comfortable ride for urban commuting",
    pricePerHour: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop",
  },
  {
    name: "Speed Racer",
    type: "road",
    description: "Lightweight and fast for road cycling",
    pricePerHour: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=300&fit=crop",
  },
  {
    name: "Eco Electric",
    type: "electric",
    description: "Electric assist for effortless riding",
    pricePerHour: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
  },
  {
    name: "Trail Blazer",
    type: "mountain",
    description: "Heavy-duty mountain bike for extreme trails",
    pricePerHour: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop",
  },
  {
    name: "Urban Commuter",
    type: "city",
    description: "Practical city bike with basket and lights",
    pricePerHour: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing bikes
    await Bike.deleteMany({});
    console.log("Cleared existing bikes");

    // Insert seed data
    const bikes = await Bike.insertMany(bikesData);
    console.log(`✅ Inserted ${bikes.length} bikes`);

    // Log inserted bikes with their IDs
    bikes.forEach((bike) => {
      console.log(`  - ${bike.name} (ID: ${bike._id})`);
    });

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seed();
