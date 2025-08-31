// Google Analytics 配置
export const GA_TRACKING_ID = 'G-F9RZJ9T5KB'; // 您的实际跟踪 ID

// 初始化 gtag
export const gtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// 页面访问跟踪
export const pageview = (url) => {
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// 事件跟踪
export const event = ({ action, category, label, value }) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// 用户登录事件
export const trackLogin = (userType) => {
  event({
    action: 'login',
    category: 'User',
    label: userType, // 'student' 或 'parent'
  });
};

// 页面浏览事件
export const trackPageView = (pageName) => {
  event({
    action: 'page_view',
    category: 'Navigation',
    label: pageName,
  });
};

// 功能使用事件
export const trackFeatureUse = (featureName) => {
  event({
    action: 'feature_use',
    category: 'Engagement',
    label: featureName,
  });
};
