import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import connectDB from "./config/db.js";
import vehicleRouter from "./routes/vehicleRouter.js";
import serviceRouter from "./routes/serviceRouter.js";
import assistanceRequestRouter from "./routes/assistanceRequestRouter.js";
import driverRouter from "./routes/driverRouter.js";
import driverRequestRouter from "./routes/driverRequestRouter.js";
import cors from "cors";

dotenv.config();
const app = express();
connectDB();
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/assistance-requests", assistanceRequestRouter);

app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/driver/requests", driverRequestRouter);
app.use("/api/v1/driver-requests", driverRequestRouter);

app.listen(PORT, () => {
  console.log(`Server is running port ${PORT}`);
});
