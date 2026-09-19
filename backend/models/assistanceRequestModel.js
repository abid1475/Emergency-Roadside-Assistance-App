import mongoose from "mongoose";

const assistanceRequestSchema = new mongoose.Schema(
  {
    // User who requested assistance
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Vehicle that needs assistance
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // Roadside service requested
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Customer's current location
    location: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // Customer's description of the problem
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Current assistance request status
    status: {
      type: String,
      enum: [
        "pending",
        "driver_assigned",
        "accepted",
        "on_the_way",
        "arrived",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    // Assigned driver
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    // When driver accepts the request
    acceptedAt: {
      type: Date,
      default: null,
    },

    // When driver arrives
    arrivedAt: {
      type: Date,
      default: null,
    },

    // When request is completed
    completedAt: {
      type: Date,
      default: null,
    },

    // When request is cancelled
    cancelledAt: {
      type: Date,
      default: null,
    },

    // Cancellation reason
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const AssistanceRequest = mongoose.model(
  "AssistanceRequest",
  assistanceRequestSchema,
);

export default AssistanceRequest;
