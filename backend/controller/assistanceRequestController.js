import AssistanceRequest from "../models/assistanceRequestModel.js";
import Driver from "../models/driverModel.js";

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
// HELPER: POPULATE REQUEST
// ======================================================

const populateRequest = async (requestId) => {
  return await AssistanceRequest.findById(requestId)
    .populate("user", "name email phone")
    .populate("vehicle")
    .populate("service")
    .populate(
      "driver",
      "name phone licenseNumber vehicle vehicleType status availability location",
    );
};

// ======================================================
// CREATE ASSISTANCE REQUEST - CUSTOMER
// ======================================================

export const createAssistanceRequest = async (req, res) => {
  try {
    const { vehicle, service, location, description } = req.body;

    if (!vehicle || !service || !location) {
      return res.status(400).json({
        success: false,
        message: "Vehicle, service and location are required",
      });
    }

    if (location.latitude === undefined || location.longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const request = await AssistanceRequest.create({
      user: req.user.userId,
      vehicle,
      service,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || "",
      },
      description: description || "",
      status: "pending",
      driver: null,
    });

    const populatedRequest = await populateRequest(request._id);

    return res.status(201).json({
      success: true,
      message: "Assistance request created successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Create Assistance Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY ASSISTANCE REQUESTS - CUSTOMER
// ======================================================

export const getMyAssistanceRequests = async (req, res) => {
  try {
    const requests = await AssistanceRequest.find({
      user: req.user.userId,
    })
      .populate("vehicle")
      .populate("service")
      .populate(
        "driver",
        "name phone licenseNumber vehicle vehicleType status availability location",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get My Assistance Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE ASSISTANCE REQUEST - CUSTOMER
// ======================================================

export const getAssistanceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AssistanceRequest.findOne({
      _id: id,
      user: req.user.userId,
    })
      .populate("user", "name email phone")
      .populate("vehicle")
      .populate("service")
      .populate(
        "driver",
        "name phone licenseNumber vehicle vehicleType status availability location",
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assistance request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get Assistance Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// CANCEL ASSISTANCE REQUEST - CUSTOMER
// ======================================================

export const cancelAssistanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const request = await AssistanceRequest.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assistance request not found",
      });
    }

    if (request.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed request cannot be cancelled",
      });
    }

    if (request.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Request is already cancelled",
      });
    }

    // If driver was assigned, make driver available
    if (request.driver) {
      const driver = await Driver.findById(request.driver);

      if (driver) {
        driver.availability = "available";
        await driver.save();
      }
    }

    request.status = "cancelled";
    request.cancelledAt = new Date();
    request.cancellationReason = cancellationReason || "";

    await request.save();

    const updatedRequest = await populateRequest(request._id);

    return res.status(200).json({
      success: true,
      message: "Assistance request cancelled successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Cancel Assistance Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// GET AVAILABLE REQUESTS - DRIVER
// ======================================================

export const getAvailableDriverRequests = async (req, res) => {
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

    if (driver.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Driver is not approved",
      });
    }

    if (driver.availability !== "available") {
      return res.status(400).json({
        success: false,
        message: "Driver must be available to receive requests",
      });
    }

    const requests = await AssistanceRequest.find({
      status: "pending",
      driver: null,
    })
      .populate("user", "name email phone")
      .populate("vehicle")
      .populate("service")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get Available Driver Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// ACCEPT ASSISTANCE REQUEST - DRIVER
// ======================================================

export const acceptAssistanceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find driver
    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Check driver approval
    if (driver.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Driver is not approved",
      });
    }

    // Check driver availability
    if (driver.availability !== "available") {
      return res.status(400).json({
        success: false,
        message: "Driver is not available",
      });
    }

    // Find request
    const request = await AssistanceRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assistance request not found",
      });
    }

    // Request must be pending
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request is no longer available",
      });
    }

    // Request must not already have driver
    if (request.driver) {
      return res.status(400).json({
        success: false,
        message: "This request has already been assigned",
      });
    }

    // Assign driver
    request.driver = driver._id;
    request.status = "accepted";
    request.acceptedAt = new Date();

    await request.save();

    // Driver becomes busy
    driver.availability = "busy";

    await driver.save();

    const updatedRequest = await populateRequest(request._id);

    return res.status(200).json({
      success: true,
      message: "Assistance request accepted successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Accept Assistance Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// REJECT ASSISTANCE REQUEST - DRIVER
// ======================================================

export const rejectAssistanceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find driver
    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Check driver approval
    if (driver.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Driver is not approved",
      });
    }

    // Find pending request
    const request = await AssistanceRequest.findOne({
      _id: id,
      status: "pending",
      driver: null,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request is no longer available",
      });
    }

    // IMPORTANT:
    // Rejected request stays pending and available
    // for another driver.
    //
    // We do NOT assign this driver.
    // We do NOT make the driver busy.

    const updatedRequest = await populateRequest(request._id);

    return res.status(200).json({
      success: true,
      message: "Assistance request rejected successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Reject Assistance Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// GET DRIVER'S REQUESTS
// ======================================================

export const getDriverRequests = async (req, res) => {
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

    const requests = await AssistanceRequest.find({
      driver: driver._id,
    })
      .populate("user", "name email phone")
      .populate("vehicle")
      .populate("service")
      .populate(
        "driver",
        "name phone licenseNumber vehicle vehicleType status availability location",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get Driver Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE DRIVER REQUEST
// ======================================================

export const getDriverRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findOne({
      user: req.user.userId,
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    const request = await AssistanceRequest.findOne({
      _id: id,
      driver: driver._id,
    })
      .populate("user", "name email phone")
      .populate("vehicle")
      .populate("service")
      .populate(
        "driver",
        "name phone licenseNumber vehicle vehicleType status availability location",
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Driver request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get Driver Request By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DRIVER REQUEST STATUS
// ======================================================

export const updateDriverRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["on_the_way", "arrived", "completed"];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver request status",
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

    const request = await AssistanceRequest.findOne({
      _id: id,
      driver: driver._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or not assigned to you",
      });
    }

    if (request.status === "completed" || request.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    // accepted -> on_the_way
    if (
      status === "on_the_way" &&
      !["accepted", "driver_assigned"].includes(request.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Request must be accepted before going on the way",
      });
    }

    // on_the_way -> arrived
    if (status === "arrived" && request.status !== "on_the_way") {
      return res.status(400).json({
        success: false,
        message: "Driver must be on the way before arriving",
      });
    }

    // arrived -> completed
    if (status === "completed" && request.status !== "arrived") {
      return res.status(400).json({
        success: false,
        message: "Request can only be completed after driver arrives",
      });
    }

    request.status = status;

    if (status === "arrived") {
      request.arrivedAt = new Date();
    }

    if (status === "completed") {
      request.completedAt = new Date();

      // Driver becomes available again
      driver.availability = "available";

      await driver.save();
    }

    await request.save();

    const updatedRequest = await populateRequest(request._id);

    return res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update Driver Request Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN DRIVER - ADMIN
// ======================================================

export const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    const request = await AssistanceRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assistance request not found",
      });
    }

    if (request.status === "completed" || request.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot assign driver to ${request.status} request`,
      });
    }

    if (request.driver) {
      return res.status(400).json({
        success: false,
        message: "A driver is already assigned to this request",
      });
    }

    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    if (driver.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Driver is not approved",
      });
    }

    if (driver.availability !== "available") {
      return res.status(400).json({
        success: false,
        message: "Driver is not available",
      });
    }

    request.driver = driver._id;
    request.status = "driver_assigned";

    await request.save();

    driver.availability = "busy";

    await driver.save();

    const updatedRequest = await populateRequest(request._id);

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Assign Driver Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN / GENERAL STATUS UPDATE
// ======================================================

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "driver_assigned",
      "accepted",
      "on_the_way",
      "arrived",
      "completed",
      "cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status",
      });
    }

    const request = await AssistanceRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assistance request not found",
      });
    }

    request.status = status;

    if (status === "accepted") {
      request.acceptedAt = new Date();
    }

    if (status === "arrived") {
      request.arrivedAt = new Date();
    }

    if (status === "completed") {
      request.completedAt = new Date();

      if (request.driver) {
        const driver = await Driver.findById(request.driver);

        if (driver) {
          driver.availability = "available";
          await driver.save();
        }
      }
    }

    if (status === "cancelled") {
      request.cancelledAt = new Date();

      if (request.driver) {
        const driver = await Driver.findById(request.driver);

        if (driver) {
          driver.availability = "available";
          await driver.save();
        }
      }
    }

    await request.save();

    const updatedRequest = await populateRequest(request._id);

    return res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update Request Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
