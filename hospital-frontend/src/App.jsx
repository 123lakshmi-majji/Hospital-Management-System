import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import PatientSignup from './pages/PatientSignup.jsx'
import StaffSignup from './pages/StaffSignup.jsx'
import Profile from './pages/Profile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DoctorDashboard from './pages/DoctorDashboard.jsx'
import PatientDashboard from './pages/PatientDashboard.jsx'
import ReceptionistDashboard from './pages/ReceptionistDashboard.jsx'
import Unauthorized from './pages/Unauthorized.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import PaymentGateway from './pages/PaymentGateway.jsx'

function App() {
  const location = useLocation()

  // ✅ Check if we are on a page that should NOT have the Navbar
  const hideNavbarRoutes = ['/login', '/signup/patient', '/signup/staff']
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname)

  return (
    <div className="app-shell">
      {/* ✅ Conditionally render the Navbar */}
      {!shouldHideNavbar && <Navbar />}
      
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup/patient" element={<PatientSignup />} />
          <Route path="/signup/staff" element={<StaffSignup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'RECEPTIONIST']}>
                <PaymentGateway />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['RECEPTIONIST']}><ReceptionistDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App