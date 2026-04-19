import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminTicketsPage from './pages/AdminTicketsPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ManagerDashboard from './pages/ManagerDashboard.jsx'
import SignUp from './pages/SignUp.jsx'
import TechnicianDashboard from './pages/TechnicianDashboard.jsx'
import TicketsPage from './pages/TicketsPage.jsx'
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
        path="/tickets"
        element={
          <ProtectedRoute minRole={ROLES.USER}>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute minRole={ROLES.MANAGER}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
