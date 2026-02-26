import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LifeBuoy, Zap, Users, ShieldCheck } from 'lucide-react';

const Start = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            <div className="max-w-4xl mx-auto text-center">
                {/* Logo/Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="p-6 rounded-3xl shadow-xl" style={{ boxShadow: '0 10px 20px 5px #bc9d6e'}}>
                        <LifeBuoy size={64} className="text-white" />
                    </div>
                </div>

                {/* Project Title */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
                    SupportHub
                </h1>
                
                {/* Tagline */}
                <p className="text-xl md:text-2xl text-slate-600 mb-10 font-medium">
                    AI-Powered Customer Support System
                </p>

                {/* Project Description */}
                <div className="mb-12 space-y-6 text-slate-600 text-lg leading-relaxed">
                    <p>
                        Welcome to <span className="font-bold" style={{color: '#bc9d6e'}}>SupportHub</span>, your intelligent customer support platform that combines 
                        cutting-edge AI technology with human expertise to deliver exceptional service experiences.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                        <div className="p-6 rounded-2xl border" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #bc9d6e'}}>
                            <Zap className="mb-4 mx-auto" size={32} style={{color: '#bc9d6e'}} />
                            <h3 className="font-bold text-slate-800 mb-2">AI-Powered</h3>
                            <p className="text-sm text-slate-600">Smart triage and instant responses with advanced AI technology</p>
                        </div>
                        
                        <div className="p-6 rounded-2xl border" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #bc9d6e'}}>
                            <Users className="mb-4 mx-auto" size={32} style={{color: '#bc9d6e'}} />
                            <h3 className="font-bold text-slate-800 mb-2">User-Friendly</h3>
                            <p className="text-sm text-slate-600">Intuitive interface for seamless customer and agent interactions</p>
                        </div>
                        
                        <div className="p-6 rounded-2xl border" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #bc9d6e'}}>
                            <ShieldCheck className="mb-4 mx-auto" size={32} style={{color: '#bc9d6e'}} />
                            <h3 className="font-bold text-slate-800 mb-2">Secure & Reliable</h3>
                            <p className="text-sm text-slate-600">Enterprise-grade security with 24/7 availability</p>
                        </div>
                    </div>

            
                </div>

                {/* Start Button */}
                <button 
                    onClick={() => navigate('/home')}
                    className="px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center gap-3 mx-auto hover:scale-105 transform" style={{backgroundColor: '#bc9d6e', color: 'white'}}
                >
                    Get Started
                    <ArrowRight size={24} />
                </button>

                {/* Additional Info */}
                <p className="mt-8 text-slate-500 text-sm">
                    Experience the future of customer support
                </p>
            </div>
        </div>
    );
};

export default Start;