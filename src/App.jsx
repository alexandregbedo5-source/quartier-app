import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Profil from './pages/Profil'
import NouveauService from './pages/NouveauService'
import Messages from './pages/Messages'
import VoisinProfil from './pages/VoisinProfil'
import CommentCaMarche from './pages/CommentCaMarche'
import APropos from './pages/APropos'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/connexion" />
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 68px)' }}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/nouveau" element={
            <ProtectedRoute><NouveauService /></ProtectedRoute>
          } />
          <Route path="/profil" element={
            <ProtectedRoute><Profil /></ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute><Messages /></ProtectedRoute>
          } />
          <Route path="/voisin/:id" element={<VoisinProfil />} />
          <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}