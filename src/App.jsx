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
    <LanguageProvider>
      <ThemeProvider>
        <AppProvider>
          <UserProvider>
            <Router basename="/Student_app">
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
              </Routes>
            </Router>
          </UserProvider>
        </AppProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App