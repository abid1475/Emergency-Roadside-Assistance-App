import express from "express";

import {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controller/serviceController.js";

const router = express.Router();

// Get all active services
router.get("/", getAllServices);

// Get single service
router.get("/:id", getServiceById);

// Add new service
router.post("/", addService);

// Update service
router.put("/:id", updateService);

// Delete service
router.delete("/:id", deleteService);

export default router;
