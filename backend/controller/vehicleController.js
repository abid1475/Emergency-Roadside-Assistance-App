import Vehicle from "../models/vehicleModel.js";

// Add Vehicle
export const addVehicle = async (req, res) => {
  try {
    const { make, model, year, color, licensePlate, vehicleType } = req.body;

    if (!make || !model || !year || !color || !licensePlate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required vehicle information",
      });
    }

    const vehicle = await Vehicle.create({
      user: req.user.userId,
      make,
      model,
      year,
      color,
      licensePlate,
      vehicleType,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Add Vehicle Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get My Vehicles
export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error("Get Vehicles Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update Vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOneAndUpdate(
      {
        _id: id,
        user: req.user.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Update Vehicle Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete Vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete Vehicle Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
