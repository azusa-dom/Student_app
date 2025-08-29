import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { UserProvider } from './contexts/UserContext'
import LoginPage from './auth/LoginPage'
import ParentDashboard from './components/parent/ParentDashboard'
import StudentDashboard from './components/student/StudentDashboard'

function App() {
  return (
    <Router basename="/Student_app">
      <LanguageProvider>
        <ThemeProvider>
          <AppProvider>
            <UserProvider>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/home" element={<StudentDashboard />} />
              </Routes>
            </UserProvider>
          </AppProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  )
}

export default App