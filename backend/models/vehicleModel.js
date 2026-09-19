import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    make: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    licensePlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    vehicleType: {
      type: String,
      enum: ["Car", "SUV", "Truck", "Van", "Motorcycle", "Other"],
      default: "Car",
    },
  },
  {
    timestamps: true,
  },
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
