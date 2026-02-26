import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Your new Sprint 3 Home Page
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AgentLogin from './pages/AgentLogin';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import Start from './pages/Start';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Change root to Home and move Login to /login */}
        <Route path="/" element={<Start />} /> 
        <Route path="/home" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/agent-login" element={<AgentLogin />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        <Route path="/dashboard/agent" element={<AgentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;