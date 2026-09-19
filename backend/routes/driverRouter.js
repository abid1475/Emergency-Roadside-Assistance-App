import express from "express";

import {
  createDriver,
  getDriverProfile,
  getAllDrivers,
  getDriverById,
  updateDriverProfile,
  updateDriverAvailability,
  updateDriverLocation,
  updateDriverStatus,
  adminUpdateDriverStatus,
  deleteDriver,
} from "../controller/driverController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// DRIVER ROUTES
// =====================================================

// CREATE DRIVER
// POST /api/v1/drivers
router.post("/", protect, createDriver);

// GET LOGGED-IN DRIVER PROFILE
// GET /api/v1/drivers/profile
router.get("/profile", protect, getDriverProfile);

// UPDATE DRIVER PROFILE
// PUT /api/v1/drivers/profile
router.put("/profile", protect, updateDriverProfile);

// DELETE DRIVER PROFILE
// DELETE /api/v1/drivers/profile
router.delete("/profile", protect, deleteDriver);

// UPDATE DRIVER AVAILABILITY
// PUT /api/v1/drivers/availability
router.put("/availability", protect, updateDriverAvailability);

// UPDATE DRIVER LOCATION
// PUT /api/v1/drivers/location
router.put("/location", protect, updateDriverLocation);

// UPDATE LOGGED-IN DRIVER STATUS
// PUT /api/v1/drivers/status
router.put("/status", protect, updateDriverStatus);

// =====================================================
// ADMIN ROUTES
// =====================================================

// GET ALL DRIVERS
// Only admin can see all drivers
// GET /api/v1/drivers
router.get("/", protect, adminOnly, getAllDrivers);

// ADMIN UPDATE SPECIFIC DRIVER STATUS
// Approve / Reject / Suspend / Pending
// PUT /api/v1/drivers/:id/status
router.put("/:id/status", protect, adminOnly, adminUpdateDriverStatus);

// =====================================================
// GET DRIVER BY ID
// =====================================================

// GET /api/v1/drivers/:id
router.get("/:id", protect, getDriverById);

// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;
