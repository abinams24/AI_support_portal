import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, Headphones } from 'lucide-react';

const AgentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        try {
            // Agent login only
            const res = await axios.post('http://127.0.0.1:8000/api/auth/login', formData);
            
            // Validate that user is actually an agent
            if (res.data.role !== 'agent') {
                alert("Access denied. This login is for support agents only.");
                return;
            }
            
            // SAVE TOKEN, ROLE, AND NAME
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('userName', res.data.name || "Agent");
            
            navigate(`/dashboard/${res.data.role}`);
        } catch (err) {
            alert("Login failed. Check your agent credentials.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full p-8">
                <div className="text-center mb-10">
                    <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#bc9d6e'}}>
                        <Headphones className="text-white" size={32} style={{color: 'white'}} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Agent Login</h1>
                    <p className="text-gray-500 mt-2">Sign in to manage customer support tickets</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                            type="email" placeholder="Agent Email Address" required
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                            type="password" placeholder="Agent Password" required
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full font-bold py-3 rounded-xl shadow-lg transform transition active:scale-95" style={{backgroundColor: '#bc9d6e', color: 'white'}}>
                        Agent Sign In
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600 text-sm">
                        Agent accounts are created by system administrators only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AgentLogin;
