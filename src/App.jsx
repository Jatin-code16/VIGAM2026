import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages
import Splash from './pages/Splash'
import BranchSelect from './pages/BranchSelect'
import ERPVerify from './pages/ERPVerify'
import ProfileConfirm from './pages/ProfileConfirm'
import PhotoUpload from './pages/PhotoUpload'
import Superlative from './pages/Superlative'
import SuccessPass from './pages/SuccessPass'
import JuniorVolunteer from './pages/JuniorVolunteer'
import JuniorSuccess from './pages/JuniorSuccess'
import NotFound from './pages/NotFound'

// Admin & Checkin
import AdminDashboard from './admin/AdminDashboard'
import CheckIn from './checkin/CheckIn'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Student Flow */}
        <Route path="/" element={<Splash />} />
        <Route path="/branch" element={<BranchSelect />} />
        <Route path="/verify" element={<ERPVerify />} />
        <Route path="/profile" element={<ProfileConfirm />} />
        <Route path="/photo" element={<PhotoUpload />} />
        <Route path="/superlative" element={<Superlative />} />
        <Route path="/pass" element={<SuccessPass />} />
        <Route path="/junior-volunteer" element={<JuniorVolunteer />} />
        <Route path="/junior-success" element={<JuniorSuccess />} />

        {/* Admin & Checkin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/checkin" element={<CheckIn />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App