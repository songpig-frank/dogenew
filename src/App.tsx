import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import SubmissionsList from "./components/submissions/SubmissionsList";
import SubmissionDetail from "./components/submissions/SubmissionDetail";
import AboutPage from "./components/about/AboutPage";
import Home from "./components/home";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import SubmissionForm from "./components/submission/SubmissionForm";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import ResetPassword from "./components/auth/ResetPassword";

import { AuthProvider } from "./lib/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import SubmissionModeration from "./components/admin/SubmissionModeration";
import CommentModeration from "./components/admin/CommentModeration";
import UserManagement from "./components/admin/UserManagement";

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            {/* Main routes with shared layout */}
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="submit" element={<SubmissionForm />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<div>Contact Page</div>} />
              <Route path="privacy" element={<div>Privacy Policy</div>} />
              <Route path="terms" element={<div>Terms of Service</div>} />
              <Route path="donations" element={<div>Donations Page</div>} />
              <Route path="ai-help" element={<div>AI Help Page</div>} />
              <Route path="submissions" element={<SubmissionsList />} />
              <Route path="submissions/:id" element={<SubmissionDetail />} />
              <Route path="login" element={<LoginForm />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>

            {/* Admin routes */}
            <Route element={<MainLayout />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="submissions" element={<SubmissionModeration />} />
                <Route path="comments" element={<CommentModeration />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<div>Admin Settings</div>} />
              </Route>
            </Route>

            {/* Tempo routes */}
            {import.meta.env.VITE_TEMPO && (
              <Route path="/tempobook/*" element={null} />
            )}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
