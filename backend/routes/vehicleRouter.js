import express from "express";

import {
  addVehicle,
  getMyVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controller/vehicleController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addVehicle);

router.get("/", protect, getMyVehicles);

router.put("/:id", protect, updateVehicle);

router.delete("/:id", protect, deleteVehicle);

export default router;
