import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './pages/CandidateProfile';
import AppliedJobs from './pages/AppliedJobs';
import HRDashboard from './pages/HRDashboard';
import ManageJobs from './pages/ManageJobs';
import ManageApplicants from './pages/ManageApplicants';
import ScheduleInterview from './pages/ScheduleInterview';
import ManageBranches from './pages/ManageBranches';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/candidate/profile" element={<ProtectedRoute roles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
            <Route path="/candidate/applied" element={<ProtectedRoute roles={['candidate']}><AppliedJobs /></ProtectedRoute>} />
            <Route path="/hr/dashboard" element={<ProtectedRoute roles={['hr', 'admin']}><HRDashboard /></ProtectedRoute>} />
            <Route path="/hr/jobs" element={<ProtectedRoute roles={['hr', 'admin']}><ManageJobs /></ProtectedRoute>} />
            <Route path="/hr/applicants" element={<ProtectedRoute roles={['hr', 'admin']}><ManageApplicants /></ProtectedRoute>} />
            <Route path="/hr/interviews" element={<ProtectedRoute roles={['hr', 'admin']}><ScheduleInterview /></ProtectedRoute>} />
            <Route path="/hr/branches" element={<ProtectedRoute roles={['hr', 'admin']}><ManageBranches /></ProtectedRoute>} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
