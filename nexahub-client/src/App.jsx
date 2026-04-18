import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminBookingReviewPage from './pages/AdminBookingReviewPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ManagerDashboard from './pages/ManagerDashboard.jsx'
import SignUp from './pages/SignUp.jsx'
import TechnicianDashboard from './pages/TechnicianDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ROLES } from './auth/roles.js'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<SignUp />} />
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
      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute minRole={ROLES.TECHNICIAN}>
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute minRole={ROLES.MANAGER}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
