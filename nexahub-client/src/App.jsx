import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth + dashboards
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminBookingReviewPage from './pages/AdminBookingReviewPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import SignUp from "./pages/SignUp.jsx";
import TechnicianDashboard from "./pages/TechnicianDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ROLES } from "./auth/roles.js";

// Resources module
import ResourcesPage from "./pages/ResourcesPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import AdminResourcesPage from "./pages/AdminResourcesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute minRole={ROLES.USER}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute minRole={ROLES.USER}>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        {/* TECHNICIAN */}
        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute minRole={ROLES.TECHNICIAN}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        {/* MANAGER */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute minRole={ROLES.MANAGER}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute minRole={ROLES.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute minRole={ROLES.ADMIN}>
              <AdminBookingReviewPage />
            </ProtectedRoute>
          }
        />

        {/* RESOURCES (STUDENT SIDE) */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />

        {/* ADMIN RESOURCES */}
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute minRole={ROLES.ADMIN}>
              <AdminResourcesPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;