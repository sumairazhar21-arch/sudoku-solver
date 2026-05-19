import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">ATS<span className="brand-accent">Recruit</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/jobs" className="nav-link">Jobs</Link>

          {!user && (
            <>
              <Link to="/login" className="nav-link nav-btn-outline">Login</Link>
              <Link to="/register" className="nav-link nav-btn-primary">Register</Link>
            </>
          )}

          {user && user.role === 'candidate' && (
            <>
              <Link to="/candidate/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/candidate/profile" className="nav-link">Profile</Link>
              <Link to="/candidate/applied" className="nav-link">Applied Jobs</Link>
              <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
            </>
          )}

          {user && (user.role === 'hr' || user.role === 'admin') && (
            <>
              <Link to="/hr/dashboard" className="nav-link">HR Dashboard</Link>
              <Link to="/hr/jobs" className="nav-link">Manage Jobs</Link>
              <Link to="/hr/applicants" className="nav-link">Applicants</Link>
              <Link to="/hr/interviews" className="nav-link">Interviews</Link>
              <Link to="/hr/branches" className="nav-link">Branches</Link>
              <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
