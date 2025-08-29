import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleStart = () => {
    if (!selectedRole) return;
    setLoading(true);

    setTimeout(() => {
      // 真正的路由跳转
      navigate(selectedRole === "student" ? "/student" : "/parent");
    }, 2000);
  };

  return (
    <div className="login-page">
      {/* 背景动画 */}
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
          {/* 状态指示器 */}
          <div className="status-indicator">
            ✓ 身份验证已通过 · 请选择您的身份继续
          </div>

          {/* 品牌区域 */}
          <div className="brand-section">
            <div className="app-logo">
              <div className="logo-circle">📚</div>
            </div>
            <h1 className="app-title">欢迎使用</h1>
            <p className="app-subtitle">智能校园生活助手</p>
          </div>

          {/* 角色选择 */}
          <div className="role-selection">
            <h2 className="selection-title">请选择您的身份</h2>
            <div className="role-options">
              <div
                className={`role-card ${
                  selectedRole === "student" ? "selected" : ""
                }`}
                onClick={() => handleSelect("student")}
              >
                <div className="role-content">
                  <div className="role-icon student-icon">🎓</div>
                  <div className="role-text">
                    <div className="role-title">学生</div>
                  </div>
                </div>
                <div className="check-indicator">
                  <div className="check-icon">✓</div>
                </div>
              </div>

              <div
                className={`role-card ${
                  selectedRole === "parent" ? "selected" : ""
                }`}
                onClick={() => handleSelect("parent")}
              >
                <div className="role-content">
                  <div className="role-icon parent-icon">👥</div>
                  <div className="role-text">
                    <div className="role-title">家长</div>
                  </div>
                </div>
                <div className="check-indicator">
                  <div className="check-icon">✓</div>
                </div>
              </div>
            </div>
          </div>

          {/* 开始按钮 */}
          <button
            className="start-button"
            onClick={handleStart}
            disabled={!selectedRole || loading}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="spinner"></div>
                <span>
                  正在进入{selectedRole === "student" ? "学生" : "家长"}端...
                </span>
              </div>
            ) : (
              "开始使用"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
