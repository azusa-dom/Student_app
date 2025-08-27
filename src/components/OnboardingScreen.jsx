import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const OnboardingScreen = () => {
  const { userType, setUserType, handleEmailAuth, loading, selectedProvider } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/20 rounded-xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
            <h1 className="text-2xl font-light text-white mb-2">EduConnect</h1>
            <div className="w-12 h-px bg-white/30 mx-auto"></div>
          </div>

          {/* Auth Section */}
          <div className="space-y-3 mb-8">
            {!loading && !selectedProvider && (
              <>
                <button 
                  onClick={() => handleEmailAuth('gmail')} 
                  className="w-full py-4 px-6 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Continue with Gmail
                </button>
                
                <button 
                  onClick={() => handleEmailAuth('outlook')} 
                  className="w-full py-4 px-6 bg-white/10 text-white rounded-lg font-medium border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  Continue with Outlook
                </button>
              </>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/80 text-sm">Connecting...</p>
              </div>
            )}
          </div>

          {/* User Type Toggle */}
          {!loading && (
            <div className="bg-white/10 p-1 rounded-lg border border-white/20">
              <div className="grid grid-cols-2 gap-1">
                <button 
                  onClick={() => setUserType('student')} 
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    userType === 'student' 
                      ? 'bg-white text-gray-900' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Student
                </button>
                <button 
                  onClick={() => setUserType('parent')} 
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    userType === 'parent' 
                      ? 'bg-white text-gray-900' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Parent
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom minimal indicator */}
        <div className="flex justify-center mt-8">
          <div className="w-1 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;