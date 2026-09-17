import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute   from './components/shared/ProtectedRoute.jsx';
import Layout           from './components/shared/Layout.jsx';

// ── Public pages ──────────────────────────────────────────────────────────
import LoginPage  from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

// ── Donor pages ───────────────────────────────────────────────────────────
import DonorDashboard   from './pages/donor/DonorDashboard.jsx';
import CreateListing    from './pages/donor/CreateListing.jsx';
import MyDonations      from './pages/donor/MyDonations.jsx';
import RequirementBoard from './pages/donor/RequirementBoard.jsx';
import MatchStatus      from './pages/donor/MatchStatus.jsx';
import ChatWindow       from './pages/donor/ChatWindow.jsx';

// ── NGO pages ─────────────────────────────────────────────────────────────
import NGODashboard    from './pages/ngo/NGODashboard.jsx';
import NGORegister     from './pages/ngo/NGORegister.jsx';
import PostRequirement from './pages/ngo/PostRequirement.jsx';
import MyRequirements  from './pages/ngo/MyRequirements.jsx';
import QuotaStatus     from './pages/ngo/QuotaStatus.jsx';
import IncomingMatches from './pages/ngo/IncomingMatches.jsx';
import UsageUpdateForm from './pages/ngo/UsageUpdateForm.jsx';

// ── Admin pages ───────────────────────────────────────────────────────────
import AdminDashboard      from './pages/admin/AdminDashboard.jsx';
import VettingQueue        from './pages/admin/VettingQueue.jsx';
import UserManagement      from './pages/admin/UserManagement.jsx';
import DisputeReview       from './pages/admin/DisputeReview.jsx';
import QuotaSettings       from './pages/admin/QuotaSettings.jsx';
import AnalyticsDashboard  from './pages/admin/AnalyticsDashboard.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ─────────────────────────────────────────── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Donor routes (/donor/*) ───────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
            <Route element={<Layout />}>
              <Route path="/donor/dashboard"          element={<DonorDashboard />} />
              <Route path="/donor/create-listing"     element={<CreateListing />} />
              <Route path="/donor/my-donations"       element={<MyDonations />} />
              <Route path="/donor/requirement-board"  element={<RequirementBoard />} />
              <Route path="/donor/match-status"       element={<MatchStatus />} />
              <Route path="/donor/chat/:matchId"      element={<ChatWindow />} />
            </Route>
          </Route>

          {/* ── NGO routes (/ngo/*) ───────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
            <Route element={<Layout />}>
              <Route path="/ngo/dashboard"        element={<NGODashboard />} />
              <Route path="/ngo/register"         element={<NGORegister />} />
              <Route path="/ngo/post-requirement" element={<PostRequirement />} />
              <Route path="/ngo/my-requirements"  element={<MyRequirements />} />
              <Route path="/ngo/quota-status"     element={<QuotaStatus />} />
              <Route path="/ngo/incoming-matches" element={<IncomingMatches />} />
              <Route path="/ngo/usage-update"     element={<UsageUpdateForm />} />
            </Route>
          </Route>

          {/* ── Admin routes (/admin/*) ───────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard"  element={<AdminDashboard />} />
              <Route path="/admin/vetting"    element={<VettingQueue />} />
              <Route path="/admin/users"      element={<UserManagement />} />
              <Route path="/admin/disputes"   element={<DisputeReview />} />
              <Route path="/admin/quotas"     element={<QuotaSettings />} />
              <Route path="/admin/analytics"  element={<AnalyticsDashboard />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
