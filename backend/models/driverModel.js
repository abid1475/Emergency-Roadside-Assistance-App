import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    vehicle: {
      make: {
        type: String,
        required: true,
      },
      model: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      licensePlate: {
        type: String,
        required: true,
      },
    },

    vehicleType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    // Driver's current GPS location
    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
