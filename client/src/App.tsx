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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="trade" element={<Trade />} />
        <Route path="paper-trading" element={<PaperTrading />} />
        <Route path="backtesting" element={<Backtesting />} />
        <Route path="journal" element={<Journal />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="news" element={<News />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
