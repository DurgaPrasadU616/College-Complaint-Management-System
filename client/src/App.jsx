import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/index";
import Login from "./pages/login";
import Register from "./pages/register";
import StudentDashboard from "./pages/student/dashboard";
import NewComplaint from "./pages/student/new-complaint";
import MyComplaints from "./pages/student/my-complaints";
import StudentComplaintDetail from "./pages/student/complaint/[id]";
import AdminDashboard from "./pages/admin/dashboard";
import AdminComplaints from "./pages/admin/complaints";
import AdminComplaintDetail from "./pages/admin/complaint/[id]";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
