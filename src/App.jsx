// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Spinner from './components/common/Spinner'

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const LandRegistration = lazy(() => import('./pages/land/Registration'))
const Properties = lazy(() => import('./pages/land/Properties'))
const PropertyDetails = lazy(() => import('./pages/land/PropertyDetails'))
const Search = lazy(() => import('./pages/land/Search'))
const Verification = lazy(() => import('./pages/land/Verification'))
const Transfer = lazy(() => import('./pages/land/Transfer'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const VerificationDetails = lazy(() => import('./pages/land/VerificationDetails'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register-land" element={<LandRegistration />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/verification/:propertyId?" element={<Verification />} />
            <Route path="/verification-details/:propertyId" element={<VerificationDetails />} />
            <Route path="/properties/:id/transfer" element={<Transfer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App