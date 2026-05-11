import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './pages/ErrorPage';

// Layouts
import SuperAdminLayout from './layout/SuperAdminLayout';
import ElectionAdminLayout from './layout/ElectionAdminLayout';
import CandidateLayout from './layout/CandidateLayout';
import VoterLayout from './layout/VoterLayout';
import PublicLayout from './layout/PublicLayout';

// Authentication Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Logout from './pages/Logout';
import RequestInstitution from './pages/RequestInstitution';
import VerifyInstitution from './pages/VerifyInstitution';

// Core Pages
import ViewElectionResults from './pages/results/ViewElectionResults';
import AdminResultsManagement from './pages/admin/AdminResultsManagement';

// SuperAdmin Pages
import ManageInstitutions from './pages/superadmin/ManageInstitutions';
import SystemAnalytics from './pages/superadmin/SystemAnalytics';
import SystemSettings from './pages/superadmin/SystemSettings';
import InstitutionDetails from './pages/superadmin/InstitutionDetails';
import PendingRequestDetail from './pages/superadmin/PendingRequestDetail';
import InstitutionWizard from './pages/superadmin/InstitutionWizard';
import DashboardOverview from './pages/superadmin/DashboardOverview';
import ManageAdmins from './pages/superAdmin/ManageAdmins';  
// Admin Pages
import Elections from './pages/admin/Elections';
import ElectionDetail from './pages/admin/ElectionDetail';
import UpdateElection from './pages/admin/UpdateElection';
import CreateElectionPage from './pages/admin/CreateElection';
import UploadVoterList from './pages/admin/UploadVoterList';
import VoterListManager from './pages/admin/VoterListManager';
import ManageNominations from './pages/admin/ManageNominations';
import MonitorVoting from './pages/admin/MonitorVoting';
import PublishResults from './pages/admin/PublishResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstitutionSettings from './pages/admin/InstitutionSettings';

// Candidate Pages
import SubmitNomination from './pages/candidate/SubmitNomination';
import MyNominations from './pages/candidate/MyNominations';
import NominationDetail from './pages/candidate/NominationDetail';

// Voter/Voting Pages

import VoterStatus from './pages/voter/VoterStatus';
import VoteElectionList from './pages/voter/VoteElectionList';
import TwoFactorVerify from './pages/voter/TwoFactorVerify';
import VoteSuccess from './pages/voter/VoteSuccess';
import CastVote from './pages/voting/CastVote';
import MyVotes from './pages/voter/MyVotes';
import VoteReceiptView from './pages/voter/VoteReceiptView';

// Profile Page
import UserProfile from './pages/UserProfile';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import ElectionList from './pages/voter/ElectionList';
import SuperElectionList from './pages/superadmin/ElectionList';
import ManageCandidates from './pages/admin/Candidate';
import CandidateHistoryDashboard from './pages/candidate/CandidateHistoryDashboard';


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/verify-institution/:token" element={<VerifyInstitution />} />
          <Route path="/request-institution" element={<RequestInstitution />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/results/public/:electionId" element={<ViewElectionResults />} />
        </Route>

        {/* ==================== SUPER ADMIN ROUTES ==================== */}
        <Route element={<ProtectedRoute allowedRoles={['superAdmin']} />}>
          <Route path='/superAdmin' element={<SuperAdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="elections" element={<SuperElectionList />} />
            <Route path="manage-institutions" element={<ManageInstitutions />} />
            <Route path="institutions/:institutionId/admins" element={<ManageAdmins />} />
            <Route path="manage-admins" element={<ManageAdmins />} />
            <Route path="create-institution" element={<InstitutionWizard />} />
            <Route path="pending-requests/:id" element={<PendingRequestDetail />} />
            <Route path="institutions/:id" element={<InstitutionDetails />} />
            <Route path="system-analytics" element={<SystemAnalytics />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="elections/:id" element={<ElectionDetail />} />
            <Route path="results" element={<ViewElectionResults />} />
            <Route path="results/:electionId" element={<ViewElectionResults />} />
          </Route>
        </Route>

        {/* ==================== ELECTION ADMIN ROUTES ==================== */}
        <Route element={<ProtectedRoute allowedRoles={['electionAdmin']} />}>
          <Route path='/electionAdmin' element={<ElectionAdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="elections" element={<Elections />} />
            <Route path="elections/:id" element={<ElectionDetail />} />
            <Route path="candidates" element={<ManageCandidates />} />
            <Route path="elections/:electionId/candidates" element={<ManageCandidates />} />
            <Route path="elections/:id/edit" element={<UpdateElection />} />
            <Route path="create-election" element={<CreateElectionPage />} />
            <Route path="voter-list" element={<VoterListManager />} />
            <Route path="upload-voters" element={<UploadVoterList />} />
            <Route path="manage-nominations" element={<ManageNominations />} />
            <Route path="monitor-voting" element={<MonitorVoting />} />
            <Route path="results-management" element={<AdminResultsManagement />} />
            <Route path="results-management/:electionId" element={<AdminResultsManagement />} />
            <Route path="publish-results" element={<PublishResults />} />
            <Route path="publish-results/:electionId" element={<PublishResults />} />
            <Route path="institution-settings" element={<InstitutionSettings />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="results" element={<ViewElectionResults />} />
            <Route path="results/:electionId" element={<ViewElectionResults />} />
          </Route>
        </Route>

        {/* ==================== CANDIDATE ROUTES ==================== */}
        <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
          <Route path='/candidate' element={<CandidateLayout />}>
            <Route index element={<CandidateHistoryDashboard/>} />
            <Route path="dashboard" element={<CandidateHistoryDashboard/>} />
            <Route path="elections" element={<ElectionList />} />
            <Route path="my-nominations" element={<MyNominations />} />
            <Route path="my-nominations/:id" element={<NominationDetail />} />
            <Route path="edit-nomination/:id" element={<SubmitNomination />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="results" element={<ViewElectionResults />} />
            <Route path="results/:electionId" element={<ViewElectionResults />} />
          </Route>
        </Route>

        {/* ==================== VOTER ROUTES ==================== */}
        <Route element={<ProtectedRoute allowedRoles={['voter', 'user']} />}>
          <Route path='/voter' element={<VoterLayout />}>
            <Route index element={<Navigate to="elections" />} />
            <Route path="elections" element={<ElectionList />} />
            <Route path="submit-nomination" element={<SubmitNomination />} />
            <Route path="edit-nomination/:id" element={<SubmitNomination />} />
            <Route path="verify/:electionId" element={<TwoFactorVerify />} />
            <Route path="cast/:electionId" element={<CastVote />} />
            <Route path="vote-success" element={<VoteSuccess />} />
            <Route path="my-nominations" element={<MyNominations />} />
            <Route path="my-nominations/:id" element={<NominationDetail />} />
            <Route path="my-votes" element={<MyVotes />} />
            <Route path="vote-receipt/:confirmationCode" element={<VoteReceiptView />} />
            <Route path="voting-status" element={<VoterStatus />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="results" element={<ViewElectionResults />} />
            <Route path="results/:electionId" element={<ViewElectionResults />} />
          </Route>
        </Route>

        {/* ==================== REDIRECTS ==================== */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />
        <Route path="/voting" element={<Navigate to="/voter/elections" replace />} />
        <Route path="/vote" element={<Navigate to="/voter/elections" replace />} />
        <Route path="/elections" element={<Navigate to="/voter/elections" replace />} />
        <Route path="/results" element={<Navigate to="/results/public" replace />} />

        {/* ==================== 404 FALLBACK ==================== */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ margin: '8px' }}
          toastOptions={{
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              duration: Infinity,
            },
            style: {
              fontSize: '14px',
              maxWidth: '400px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#1e293b',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
    </BrowserRouter>
  );
};

export default App;