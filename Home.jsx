import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HelpCircle, Book, MessageCircle, ArrowRight, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const Home = () => {
    const [faqQuery, setFaqQuery] = useState('');
    const [faqResults, setFaqResults] = useState([]);
    const [allFaqs, setAllFaqs] = useState([]);
    const [selectedFaq, setSelectedFaq] = useState('');
    const [kbQuery, setKbQuery] = useState('');
    const [kbAnswer, setKbAnswer] = useState('');
    const navigate = useNavigate();

    // Check authentication state
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // Fetch all FAQs on component mount
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/ai/faq/all');
                setAllFaqs(res.data);
            } catch (err) { 
                console.error('Error fetching FAQs:', err);
                // Fallback FAQs if API fails
                setAllFaqs([
                    { question: 'How do I reset my password?', answer: 'Click on the Forgot Password link on the login page and follow the instructions.' },
                    { question: 'What are your support hours?', answer: 'Our support team is available 24/7 for urgent issues and 9-5 PM for general inquiries.' },
                    { question: 'How do I create a support ticket?', answer: 'Log in to your dashboard and click on "Raise a Ticket" to submit your request.' },
                    { question: 'How do I contact customer support?', answer: 'You can contact customer support by calling 1-800-123-4567 or emailing support@company.com.' },
                    { question: 'How do I view my support tickets?', answer: 'Go to your dashboard and click on "My Tickets" to view all your support tickets.' }
                ]);
            }
        };
        fetchFaqs();
    }, []);

    // Handle FAQ selection from dropdown
    const handleFaqSelect = (faqText) => {
        setSelectedFaq(faqText);
        const selected = allFaqs.find(faq => `${faq.question} - ${faq.answer.substring(0, 50)}...` === faqText);
        if (selected) {
            setFaqResults([selected]);
        }
    };

    // Task 3: KB Search
    const handleKbSearch = async () => {
        const formData = new FormData();
        formData.append('question', kbQuery);
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/ai/ask', formData);
            setKbAnswer(res.data.answer);
        } catch (err) { console.error(err); }
    };

    // Task 4: Gateway Logic
    const handleContactAgent = () => {
        if (!token) {
            // Not logged in: Force Login first
            navigate('/login');
        } else {
            // Already logged in: Go straight to their portal
            navigate(`/dashboard/${userRole}`);
        }
    };

    return (
        <div className="min-h-screen" style={{background: 'linear-gradient(to bottom, #569296, #eff1e8)'}}>
            {/* Hero Section */}
            <div className="py-20 px-6 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How can we help you today?</h1>
                <p className="text-white/90 text-lg">Search or chat with our AI assistant.</p>
                
                {/* Login Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => navigate('/admin-login')}
                        className="px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2" style={{backgroundColor: '#bc9d6e', color: 'white'}}
                    >
                        <ShieldCheck size={20} />
                        Login as Admin
                    </button>
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-8 py-3 rounded-2xl font-bold transition-all shadow-lg border flex items-center justify-center gap-2" style={{backgroundColor: 'rgba(188, 157, 110, 0.8)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)'}}
                    >
                        <User size={20} />
                        Login as User
                    </button>
                    <button 
                        onClick={() => navigate('/agent-login')}
                        className="px-8 py-3 rounded-2xl font-bold transition-all shadow-lg border flex items-center justify-center gap-2" style={{backgroundColor: 'rgba(188, 157, 110, 0.8)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)'}}
                    >
                        <ShieldCheck size={20} />
                        Login as Agent
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto -mt-12 px-6 grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                {/* LEFT: FAQ Dropdown */}
                <div className="p-8 rounded-3xl shadow-xl" style={{backgroundColor: 'white', border: '1px solid #bc9d6e'}}>
                    <div className="flex items-center gap-3 mb-6" style={{color: '#bc9d6e'}}>
                        <HelpCircle size={28} />
                        <h2 className="text-2xl font-bold text-slate-800">Quick FAQs</h2>
                    </div>
                    <div className="mb-6">
                        <select 
                            className="w-full p-3 rounded-2xl outline-none transition-all cursor-pointer" 
                            style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            value={selectedFaq}
                            onChange={(e) => handleFaqSelect(e.target.value)}
                        >
                            <option value="">Select a frequently asked question...</option>
                            {allFaqs.map((faq, i) => (
                                <option key={i} value={`${faq.question} - ${faq.answer.substring(0, 50)}...`}>
                                    {faq.question}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-3">
                        {faqResults.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl border" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #bc9d6e'}}>
                                <p className="font-bold text-sm text-slate-700">Q: {item.question}</p>
                                <p className="text-sm text-slate-500 mt-1">A: {item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: KB / RAG Search */}
                <div className="p-8 rounded-3xl shadow-xl" style={{backgroundColor: 'white', border: '1px solid #8b5cf6'}}>
                    <div className="flex items-center gap-3 mb-6" style={{color: '#bc9d6e'}}>
                        <Book size={28} />
                        <h2 className="text-2xl font-bold text-slate-800">Knowledge Base</h2>
                    </div>
                    <div className="flex gap-2 mb-6">
                        <input 
                            type="text" placeholder="Ask AI about our manuals..."
                            className="flex-1 p-3 rounded-2xl outline-none transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#569296'}}
                            onChange={(e) => setKbQuery(e.target.value)}
                        />
                        <button onClick={handleKbSearch} className="text-white p-3 rounded-2xl transition-colors" style={{backgroundColor: '#bc9d6e'}}>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                    {kbAnswer && (
                        <div className="p-4 rounded-xl border text-sm" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #bc9d6e', color: '#569296'}}>
                            <strong>AI Response:</strong> {kbAnswer}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom CTA Section */}
            <div className="text-center pb-20 mt-10">
                <p className="text-slate-500 mb-4 font-medium text-lg">Issue finding the answer?</p>
                <button 
                    onClick={handleContactAgent}
                    className="px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto transition-all shadow-lg" style={{backgroundColor: '#bc9d6e', color: 'white'}}
                >
                    <MessageCircle size={20} /> Contact Our Agent
                </button>
            </div>
        </div>
    );
};

export default Home;