import { Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Trade from './pages/Trade'
import PaperTrading from './pages/PaperTrading'
import Backtesting from './pages/Backtesting'
import Journal from './pages/Journal'
import Alerts from './pages/Alerts'
import News from './pages/News'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes with layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="trade" element={
          <ProtectedRoute><Trade /></ProtectedRoute>
        } />
        <Route path="paper-trading" element={
          <ProtectedRoute><PaperTrading /></ProtectedRoute>
        } />
        <Route path="backtesting" element={
          <ProtectedRoute><Backtesting /></ProtectedRoute>
        } />
        <Route path="journal" element={
          <ProtectedRoute><Journal /></ProtectedRoute>
        } />
        <Route path="alerts" element={
          <ProtectedRoute><Alerts /></ProtectedRoute>
        } />
        <Route path="news" element={<News />} />
        <Route path="settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
