import Service from "../models/serviceModel.js";

// Add New Service

export const addService = async (req, res) => {
  try {
    const { name, description, icon, basePrice, estimatedTime } = req.body;

    // Check required fields
    if (
      !name ||
      !description ||
      !icon ||
      basePrice === undefined ||
      !estimatedTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required service information",
      });
    }

    // Check if service already exists
    const existingService = await Service.findOne({
      name: name.trim(),
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists",
      });
    }

    // Create service
    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),
      basePrice,
      estimatedTime: estimatedTime.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    console.error("Add Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get All Services

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get Services Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get Single Service

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update Service

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, icon, basePrice, estimatedTime, isActive } =
      req.body;

    const service = await Service.findByIdAndUpdate(
      id,
      {
        name,
        description,
        icon,
        basePrice,
        estimatedTime,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Delete Service

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
