import express from "express";

import {
  getAvailableDriverRequests,
  acceptAssistanceRequest,
  getDriverRequests,
  getDriverRequestById,
  updateDriverRequestStatus,
} from "../controller/assistanceRequestController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// DRIVER REQUEST ROUTES
// ======================================================

// Get available/pending requests
router.get("/available", protect, getAvailableDriverRequests);

// Get requests assigned to logged-in driver
router.get("/my-requests", protect, getDriverRequests);

// Get single driver request
router.get("/:id", protect, getDriverRequestById);

// Accept request
router.put("/:id/accept", protect, acceptAssistanceRequest);

// Update request status
router.put("/:id/status", protect, updateDriverRequestStatus);

export default router;
