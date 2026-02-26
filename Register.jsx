import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);

        try {
            // Only allow customer registration - no admin registration
            await axios.post('http://127.0.0.1:8000/api/auth/register/customer', data);
            alert("Customer account created! Please login.");
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.detail || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#bc9d6e'}}>
                        <UserPlus className="text-white" size={32} style={{color: 'white'}} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Create Customer Account</h1>
                    <p className="text-slate-500 mt-2">Join our AI support community as a customer</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input 
                            type="text" placeholder="Full Name" required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input 
                            type="email" placeholder="Email Address" required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <button className="w-full font-bold py-4 rounded-2xl shadow-lg" style={{backgroundColor: '#bc9d6e', color: 'white'}}>
                        Register Now
                    </button>
                </form>
                
                <p className="text-center mt-6 text-slate-500 text-sm">
                    Already have an account? <Link to="/login" className="font-bold hover:underline" style={{color: '#bc9d6e'}}>Login</Link>
                </p>
            </div>
        </div> 
    );
};

export default Register;