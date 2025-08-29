// src/auth/LoginPage.jsx
import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleStart = () => {
    if (selectedRole) {
      setIsLoading(true);
      // Simulate navigation or authentication logic
      setTimeout(() => {
        setIsLoading(false);
        // Add navigation logic here, e.g., to /parent/dashboard or /student/dashboard
      }, 2000);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-animation">
        <div className="floating-element element1"></div>
        <div className="floating-element element2"></div>
        <div className="floating-element element3"></div>
        <div className="floating-element element4"></div>
        <div className="floating-element element5"></div>
        <div className="floating-element element6"></div>
      </div>
      <div className="login-wrapper">
        <div className="login-container">
          <div className="status-indicator">System Online</div>
          <div className="brand-section">
            <div className="app-logo">
              <div className="logo-circle">S</div>
            </div>
            <h1 className="app-title">Student App</h1>
            <p className="app-subtitle">Choose your role to continue</p>
          </div>
          <div className="role-selection">
            <h2 className="selection-title">Select Your Role</h2>
            <div className="role-options">
              <div
                className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="role-content">
                  <div className="role-icon student-icon">S</div>
                  <div className="role-text">
                    <h3 className="role-title">Student</h3>
                    <p className="role-description">Access your courses, assignments, and grades.</p>
                  </div>
                  <div className="check-indicator">
                    <span className="check-icon">✓</span>
                  </div>
                </div>
              </div>
              <div
                className={`role-card ${selectedRole === 'parent' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('parent')}
              >
                <div className="role-content">
                  <div className="role-icon parent-icon">P</div>
                  <div className="role-text">
                    <h3 className="role-title">Parent</h3>
                    <p className="role-description">Monitor your child's progress and updates.</p>
                  </div>
                  <div className="check-indicator">
                    <span className="check-icon">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            className="start-button"
            onClick={handleStart}
            disabled={!selectedRole || isLoading}
          >
            {isLoading ? (
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;