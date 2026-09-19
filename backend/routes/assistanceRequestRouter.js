import express from "express";

import {
  createAssistanceRequest,
  getMyAssistanceRequests,
  getAssistanceRequestById,
  cancelAssistanceRequest,
  updateRequestStatus,
  assignDriver,
  rejectAssistanceRequest,
  getDriverRequests,
  getDriverRequestById,
  updateDriverRequestStatus,
} from "../controller/assistanceRequestController.js";

import { protect } from "../middleware/authMiddleware.js";
import { updateDriverLocation } from "../controller/driverController.js";

const router = express.Router();

// ======================================================
// CUSTOMER ROUTES
// ======================================================

// Create assistance request
router.post("/", protect, createAssistanceRequest);

// Get logged-in customer's requests
router.get("/my-requests", protect, getMyAssistanceRequests);

// Get single customer request
router.get("/:id", protect, getAssistanceRequestById);

// Cancel customer request
router.put("/:id/cancel", protect, cancelAssistanceRequest);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Admin updates request status
router.put("/:id/status", protect, updateRequestStatus);

// Admin assigns a driver
router.put("/:id/assign-driver", protect, assignDriver);

router.put("/:id/reject", protect, rejectAssistanceRequest);
router.get("/driver/my", protect, getDriverRequests);
router.get("/driver/:id", protect, getDriverRequestById);
router.put("/driver/:id/status", protect, updateDriverRequestStatus);

export default router;
