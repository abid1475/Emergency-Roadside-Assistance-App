import mongoose from "mongoose";
import Driver from "../models/driverModel.js";

// ======================================================
// CREATE DRIVER
// ======================================================

export const createDriver = async (req, res) => {
  try {
    const { name, phone, licenseNumber, vehicle, vehicleType } = req.body;

    // Check authentication
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    // Check required fields
    if (!name || !phone || !licenseNumber || !vehicle) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, license number and vehicle are required",
      });
    }

    // Check vehicle fields
    if (
      !vehicle.make ||
      !vehicle.model ||
      !vehicle.year ||
      !vehicle.color ||
      !vehicle.licensePlate
    ) {
      return res.status(400).json({
        success: false,
        message: "Vehicle make, model, year and license plate are required",
      });
    }

    // Check if user already has a driver profile
    const existingDriver = await Driver.findOne({
      user: req.user.userId,
    });

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: "Driver profile already exists for this user",
        driver: existingDriver,
      });
    }

    // Check license number
    const existingLicense = await Driver.findOne({
      licenseNumber: licenseNumber.trim(),
    });

    if (existingLicense) {
      return res.status(409).json({
        success: false,
        message: "License number is already registered",
      });
    }

    // Check vehicle license plate
    const existingPlate = await Driver.findOne({
      "vehicle.licensePlate": vehicle.licensePlate.trim(),
    });

    if (existingPlate) {
      return res.status(409).json({
        success: false,
        message: "Vehicle license plate is already registered",
      });
    }

    // Create driver
    const driver = await Driver.create({
      user: req.user.userId,

      name: name.trim(),

      phone: phone.trim(),

      licenseNumber: licenseNumber.trim(),

      vehicle: {
        make: vehicle.make.trim(),
        model: vehicle.model.trim(),
        year: Number(vehicle.year),
        color: vehicle.color.trim(),
        licensePlate: vehicle.licensePlate.trim(),
      },

      vehicleType: vehicleType || "tow-truck",

      // New driver starts pending/offline
      status: "pending",
      availability: "offline",

      // Driver has no location when profile is created
      currentLocation: {
        latitude: null,
        longitude: null,
        updatedAt: null,
      },
    });

    // Populate user information
    const populatedDriver = await Driver.findById(driver._id).populate(
      "user",
      "name email phone role",
    );

    return res.status(201).json({
      success: true,
      message: "Driver profile created successfully",
      driver: populatedDriver,
    });
  } catch (error) {
    console.error("Create Driver Error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A driver, license number, or vehicle license plate already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create driver profile",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY DRIVER PROFILE
// ======================================================

export const getMyDriverProfile = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    }).populate("user", "name email phone role");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver profile fetched successfully",
      driver,
    });
  } catch (error) {
    console.error("Get My Driver Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get driver profile",
      error: error.message,
    });
  }
};

// ======================================================
// GET DRIVER PROFILE
// ======================================================

export const getDriverProfile = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    }).populate("user", "name email phone role");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver profile fetched successfully",
      driver,
    });
  } catch (error) {
    console.error("Get Driver Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get driver profile",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL DRIVERS
// ======================================================

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error("Get All Drivers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get drivers",
      error: error.message,
    });
  }
};

// ======================================================
// GET DRIVER BY ID
// ======================================================

export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID",
      });
    }

    const driver = await Driver.findById(id).populate(
      "user",
      "name email phone role",
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver fetched successfully",
      driver,
    });
  } catch (error) {
    console.error("Get Driver By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get driver",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DRIVER PROFILE
// ======================================================

export const updateDriverProfile = async (req, res) => {
  try {
    const { name, phone, licenseNumber, vehicle, vehicleType } = req.body;

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Update name
    if (name !== undefined) {
      driver.name = name.trim();
    }

    // Update phone
    if (phone !== undefined) {
      driver.phone = phone.trim();
    }

    // Update license number
    if (
      licenseNumber !== undefined &&
      licenseNumber.trim() !== driver.licenseNumber
    ) {
      const existingLicense = await Driver.findOne({
        licenseNumber: licenseNumber.trim(),
        _id: { $ne: driver._id },
      });

      if (existingLicense) {
        return res.status(409).json({
          success: false,
          message: "License number is already registered",
        });
      }

      driver.licenseNumber = licenseNumber.trim();
    }

    // Update vehicle
    if (vehicle) {
      if (vehicle.make !== undefined) {
        driver.vehicle.make = vehicle.make.trim();
      }

      if (vehicle.model !== undefined) {
        driver.vehicle.model = vehicle.model.trim();
      }

      if (vehicle.year !== undefined) {
        driver.vehicle.year = Number(vehicle.year);
      }

      if (vehicle.color !== undefined) {
        driver.vehicle.color = vehicle.color.trim();
      }

      if (vehicle.licensePlate !== undefined) {
        const newPlate = vehicle.licensePlate.trim();

        if (newPlate !== driver.vehicle.licensePlate) {
          const existingPlate = await Driver.findOne({
            "vehicle.licensePlate": newPlate,
            _id: { $ne: driver._id },
          });

          if (existingPlate) {
            return res.status(409).json({
              success: false,
              message: "Vehicle license plate is already registered",
            });
          }

          driver.vehicle.licensePlate = newPlate;
        }
      }
    }

    // Update vehicle type
    if (vehicleType !== undefined) {
      const allowedVehicleTypes = [
        "tow-truck",
        "flatbed",
        "recovery-truck",
        "roadside-vehicle",
        "other",
      ];

      if (!allowedVehicleTypes.includes(vehicleType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid vehicle type",
        });
      }

      driver.vehicleType = vehicleType;
    }

    await driver.save();

    const updatedDriver = await Driver.findById(driver._id).populate(
      "user",
      "name email phone role",
    );

    return res.status(200).json({
      success: true,
      message: "Driver profile updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Update Driver Profile Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "License number or vehicle license plate already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update driver profile",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DRIVER AVAILABILITY
// ======================================================

export const updateDriverAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const allowedAvailability = ["available", "busy", "offline"];

    if (!availability || !allowedAvailability.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Availability must be available, busy, or offline",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Only approved drivers can become available
    if (availability === "available" && driver.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved drivers can change availability to available",
      });
    }

    // Suspended/rejected drivers must remain offline
    if (
      (driver.status === "suspended" || driver.status === "rejected") &&
      availability !== "offline"
    ) {
      return res.status(400).json({
        success: false,
        message: "Suspended or rejected drivers must remain offline",
      });
    }

    driver.availability = availability;

    await driver.save();

    return res.status(200).json({
      success: true,
      message: `Driver availability updated to ${availability}`,
      driver,
    });
  } catch (error) {
    console.error("Update Driver Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver availability",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DRIVER LOCATION
// ======================================================

export const updateDriverLocation = async (req, res) => {
  try {
    // Check authentication
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const { latitude, longitude } = req.body;

    // Check required fields
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Convert to numbers
    const lat = Number(latitude);
    const lng = Number(longitude);

    // Check valid numbers
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers",
      });
    }

    // Validate latitude
    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude. Must be between -90 and 90",
      });
    }

    // Validate longitude
    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude. Must be between -180 and 180",
      });
    }

    // Find driver using logged-in user's ID
    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Only approved drivers can update their GPS location
    if (driver.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Only approved drivers can update their location",
      });
    }

    // Update driver's current location
    driver.currentLocation = {
      latitude: lat,
      longitude: lng,
      updatedAt: new Date(),
    };

    await driver.save();

    return res.status(200).json({
      success: true,
      message: "Driver location updated successfully",
      location: driver.currentLocation,
    });
  } catch (error) {
    console.error("Update Driver Location Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver location",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DRIVER STATUS
// DRIVER UPDATES HIS OWN STATUS
// ======================================================

export const updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["pending", "approved", "suspended", "rejected"];

    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, approved, suspended, or rejected",
      });
    }

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    driver.status = status;

    if (
      status === "suspended" ||
      status === "rejected" ||
      status === "pending"
    ) {
      driver.availability = "offline";
    }

    await driver.save();

    return res.status(200).json({
      success: true,
      message: `Driver status updated to ${status}`,
      driver,
    });
  } catch (error) {
    console.error("Update Driver Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver status",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN UPDATE DRIVER STATUS
// ADMIN APPROVES / REJECTS / SUSPENDS A DRIVER
// ======================================================

export const adminUpdateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check driver ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID",
      });
    }

    // Allowed statuses for admin
    const allowedStatus = ["approved", "rejected", "suspended", "pending"];

    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved, rejected, suspended, or pending",
      });
    }

    // Find driver by driver ID
    const driver = await Driver.findById(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Update status
    driver.status = status;

    // Approved driver starts offline.
    // Driver can manually change availability to available.
    if (status === "approved") {
      driver.availability = "offline";
    }

    // These statuses must remain offline
    if (
      status === "rejected" ||
      status === "suspended" ||
      status === "pending"
    ) {
      driver.availability = "offline";
    }

    await driver.save();

    // Return updated driver with user information
    const updatedDriver = await Driver.findById(driver._id).populate(
      "user",
      "name email phone role",
    );

    return res.status(200).json({
      success: true,
      message: `Driver ${status} successfully`,
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Admin Update Driver Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver status",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE DRIVER
// ======================================================

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    await Driver.findByIdAndDelete(driver._id);

    return res.status(200).json({
      success: true,
      message: "Driver profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete Driver Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete driver profile",
      error: error.message,
    });
  }
};
