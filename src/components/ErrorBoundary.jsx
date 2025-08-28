import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center shadow-xl shadow-red-500/10 max-w-lg">
              <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-rose-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">抱歉，出现了一些问题</h2>
              <p className="text-gray-600 text-center mb-6">
                应用遇到了意外错误。请刷新页面重试，如果问题持续存在，请联系支持团队。
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                刷新页面
              </button>
              {/* 临时在生产环境显示错误信息以便调试 */}
              <div className="mt-4 p-4 bg-gray-900 rounded-xl w-full overflow-auto">
                <pre className="text-red-400 text-sm">
                  {this.state.error?.toString()}
                  {this.state.error?.stack && (
                    <div className="mt-2 text-xs opacity-70">
                      {this.state.error.stack}
                    </div>
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
