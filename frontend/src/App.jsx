import { Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
// Authentication
import Register from "./pages/Register";
import Login from "./pages/Login";

// Customer Pages
import Profile from "./pages/Profile";
import Vehicles from "./pages/Vehicles";
import AddVehicle from "./pages/AddVehicle";
import EditVehicle from "./pages/EditVehicle";

// Services & Assistance
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import RequestAssistance from "./pages/RequestAssistance";
import MyRequests from "./pages/MyRequests";
import RequestDetails from "./pages/RequestDetails";
import TrackRequest from "./pages/TrackRequest";

// Driver Pages
import DriverDashboard from "./pages/DriverDashboard";
import DriverProfile from "./pages/DriverProfile";
import DriverRequestDetails from "./pages/DriverRequestDetails";

// Admin
import Admin from "./pages/Admin";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ==========================================
          PUBLIC ROUTES
      ========================================== */}

        {/* Register */}
        <Route path="/" element={<Register />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ==========================================
          PROTECTED ROUTES
      ========================================== */}

        <Route element={<ProtectedRoute />}>
          {/* ==========================================
            CUSTOMER PROFILE
        ========================================== */}

          <Route path="/profile" element={<Profile />} />

          {/* ==========================================
            VEHICLE MANAGEMENT
        ========================================== */}

          <Route path="/vehicles" element={<Vehicles />} />

          <Route path="/vehicles/add" element={<AddVehicle />} />

          <Route path="/vehicles/edit/:id" element={<EditVehicle />} />

          {/* ==========================================
            SERVICES
        ========================================== */}

          <Route path="/services" element={<Services />} />

          <Route path="/services/:id" element={<ServiceDetails />} />

          {/* ==========================================
            ASSISTANCE REQUEST
        ========================================== */}

          <Route
            path="/request-assistance/:serviceId"
            element={<RequestAssistance />}
          />

          {/* ==========================================
            CUSTOMER REQUESTS
        ========================================== */}

          <Route path="/my-requests" element={<MyRequests />} />

          {/* Request Details */}

          <Route path="/request/:id" element={<RequestDetails />} />

          {/* Track Request */}

          <Route path="/track-request/:id" element={<TrackRequest />} />

          {/* ==========================================
            DRIVER
        ========================================== */}

          <Route path="/driver/dashboard" element={<DriverDashboard />} />

          <Route path="/driver/profile" element={<DriverProfile />} />

          <Route
            path="/driver/requests/:id"
            element={<DriverRequestDetails />}
          />

          {/* ==========================================
            ADMIN
        ========================================== */}

          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
