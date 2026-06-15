import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB database");
  } catch (error) {
    console.log("Failed to connect to database", error);
    process.exit(1);
  }
};
