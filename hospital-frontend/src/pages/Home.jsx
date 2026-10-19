import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* ============== HERO WITH BG IMAGE ============== */}
      <section className="hms-hero-with-bg">
        <div className="hero-overlay">
          <div className="row align-items-center">
            {/* Left text */}
            <div className="col-lg-7">
              <div className="hero-content-left">
                <span className="hero-badge">
                  <i className="bi bi-shield-check me-1"></i>
                  Trusted Healthcare Platform
                </span>

                <h1 className="hero-title">
                  Welcome to <span className="hero-brand">Hospivexa</span>
                </h1>

                <p className="hero-subtitle">
                  Your complete hospital management system — appointments, medical
                  records, prescriptions, and staff coordination, all in one secure place.
                </p>

                <div className="hero-cta">
                  <a href="#portals" className="btn btn-light btn-lg">
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    Get Started
                  </a>
                  <Link to="/login" className="btn btn-hero-outline btn-lg">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </Link>
                </div>

                {/* Floating stats */}
                <div className="hero-stats">
                  <div className="hero-stat">
                    <div className="hero-stat-value">24/7</div>
                    <div className="hero-stat-label">Care Access</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-value">100%</div>
                    <div className="hero-stat-label">Secure</div>
                  </div>
                  <div className="hero-stat">
                    <div className="hero-stat-value">4</div>
                    <div className="hero-stat-label">User Roles</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - visual decoration */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-visual">
                <div className="hero-visual-card card-1">
                  <i className="bi bi-calendar-check"></i>
                  <div>
                    <strong>Appointment</strong>
                    <small>Booked successfully</small>
                  </div>
                </div>
                <div className="hero-visual-card card-2">
                  <i className="bi bi-file-medical"></i>
                  <div>
                    <strong>Medical Record</strong>
                    <small>Updated</small>
                  </div>
                </div>
                <div className="hero-visual-card card-3">
                  <i className="bi bi-capsule"></i>
                  <div>
                    <strong>Prescription</strong>
                    <small>Ready</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PORTALS SECTION ============== */}
      <div className="container py-5" id="portals">
        {/* Section header */}
        <div className="text-center mb-5">
          <div className="section-heading-row">
            <span className="badge portal-badge px-3 py-2 rounded-pill">
              <i className="bi bi-grid me-1"></i> Access Portals
            </span>
            <h2 className="section-heading mb-0">Choose Your Portal</h2>
          </div>
          <p className="text-white-50 mt-2">Select how you want to access the system</p>
        </div>

        {/* Portal cards */}
        <div className="row g-4 justify-content-center">
          {/* Patient Portal */}
          <div className="col-md-5">
            <div className="portal-card patient">
              <div className="portal-icon patient-icon">
                <i className="bi bi-person-heart"></i>
              </div>
              <h3>Patient Portal</h3>
              <p className="portal-desc">
                Book appointments, view your medical records and prescriptions — all from your dashboard.
              </p>
              <div className="d-grid gap-2">
                <Link to="/signup/patient" className="btn btn-primary btn-lg">
                  <i className="bi bi-person-plus me-2"></i>
                  Register as Patient
                </Link>
                <Link to="/login" className="btn btn-outline-primary">
                  Already registered? Login
                </Link>
              </div>
            </div>
          </div>

          {/* Staff Portal */}
          <div className="col-md-5">
            <div className="portal-card staff">
              <div className="portal-icon staff-icon">
                <i className="bi bi-person-badge"></i>
              </div>
              <h3>Staff Portal</h3>
              <p className="portal-desc">
                For doctors, receptionists, and administrators. Requires an employee code from HR.
              </p>
              <div className="d-grid gap-2">
                <Link to="/signup/staff" className="btn btn-success btn-lg">
                  <i className="bi bi-clipboard-plus me-2"></i>
                  Register as Staff
                </Link>
                <Link to="/login" className="btn btn-outline-success">
                  Staff login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-strip mt-5">
          <div className="feature-item">
            <div className="feature-icon"><i className="bi bi-calendar-check"></i></div>
            <div>
              <h6>Smart Scheduling</h6>
              <p>Book and manage appointments</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><i className="bi bi-file-medical"></i></div>
            <div>
              <h6>Medical Records</h6>
              <p>Secure digital health records</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><i className="bi bi-capsule"></i></div>
            <div>
              <h6>E-Prescriptions</h6>
              <p>Digital prescriptions from doctors</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><i className="bi bi-shield-lock"></i></div>
            <div>
              <h6>Role-Based Access</h6>
              <p>Secure JWT authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}