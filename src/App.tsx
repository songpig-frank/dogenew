import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import SubmissionForm from "./components/submission/SubmissionForm";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Main routes with shared layout */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="submit" element={<SubmissionForm />} />
          <Route path="about" element={<div>About Page</div>} />
          <Route path="contact" element={<div>Contact Page</div>} />
          <Route path="privacy" element={<div>Privacy Policy</div>} />
          <Route path="terms" element={<div>Terms of Service</div>} />
          <Route path="donations" element={<div>Donations Page</div>} />
          <Route path="ai-help" element={<div>AI Help Page</div>} />
        </Route>

        {/* Admin routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="submissions"
            element={<div>Submissions Management</div>}
          />
          <Route path="users" element={<div>User Management</div>} />
          <Route path="settings" element={<div>Admin Settings</div>} />
        </Route>

        {/* Tempo routes at the end */}
        {import.meta.env.VITE_TEMPO === "true" && (
          <Route path="tempobook/*" element={null} />
        )}
      </Routes>
    </Suspense>
  );
}

export default App;
