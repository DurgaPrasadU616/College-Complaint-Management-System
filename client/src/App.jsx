import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/index";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import StudentDashboard from "./pages/student/dashboard";
import NewComplaint from "./pages/student/new-complaint";
import MyComplaints from "./pages/student/my-complaints";
import StudentComplaintDetail from "./pages/student/complaint/[id]";
import StudentNotifications from "./pages/student/notifications";
import AdminDashboard from "./pages/admin/dashboard";
import AdminComplaints from "./pages/admin/complaints";
import AdminComplaintDetail from "./pages/admin/complaint/[id]";
import AdminNotifications from "./pages/admin/notifications";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/new-complaint"
          element={
            <ProtectedRoute role="student">
              <NewComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-complaints"
          element={
            <ProtectedRoute role="student">
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/complaint/:id"
          element={
            <ProtectedRoute role="student">
              <StudentComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute role="student">
              <StudentNotifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute role="admin">
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaint/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminComplaintDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute role="admin">
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
