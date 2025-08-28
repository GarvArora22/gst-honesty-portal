import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, ShieldAlert, FileText, BarChart2, IndianRupee, Building, UserCog, UploadCloud, X, Award, User, ArrowRight, AlertTriangle, DollarSign, BookOpen, ChevronDown } from 'lucide-react';

// --- Mock Data (Simulating a Database) ---
const initialBills = [
    { id: 'b1', shopName: 'ABC Electronics', city: 'Delhi', billAmount: 1200, registered: true, timestamp: '2025-08-27T10:00:00Z', billImage: 'bill1.jpg', submittedBy: '9876543210', justification: null, awarded: true },
    { id: 'b2', shopName: 'Local Kirana', city: 'Mumbai', billAmount: 550, registered: false, timestamp: '2025-08-27T11:30:00Z', billImage: 'bill2.jpg', submittedBy: '9988776655', justification: null, awarded: false },
    { id: 'b3', shopName: 'Fashion Hub', city: 'Bengaluru', billAmount: 8000, registered: true, timestamp: '2025-08-28T09:15:00Z', billImage: 'bill3.jpg', submittedBy: '9876543210', justification: null, awarded: false },
    { id: 'b4', shopName: 'Chai Stall', city: 'Delhi', billAmount: 600, registered: false, timestamp: '2025-08-28T14:00:00Z', billImage: 'bill4.jpg', submittedBy: '9123456789', justification: 'Cash transaction, customer did not ask for GST bill.', awarded: false },
    { id: 'b5', shopName: 'Premium Furnitures', city: 'Chennai', billAmount: 25000, registered: true, timestamp: '2025-08-28T18:45:00Z', billImage: 'bill5.jpg', submittedBy: null, justification: null, awarded: false },
    { id: 'b6', shopName: 'Local Kirana', city: 'Mumbai', billAmount: 750, registered: false, timestamp: '2025-08-28T20:00:00Z', billImage: 'bill6.jpg', submittedBy: '9876543210', justification: null, awarded: true },
];

const initialUsers = {
    'SHOP123': { id: 'SHOP123', role: 'shop', shopName: 'Local Kirana', password: 'password', warnings: 1, penalties: 0 },
    'SHOP456': { id: 'SHOP456', role: 'shop', shopName: 'ABC Electronics', password: 'password', warnings: 0, penalties: 0 },
    'SHOP789': { id: 'SHOP789', role: 'shop', shopName: 'Chai Stall', password: 'password', warnings: 0, penalties: 0 },
    'GOVT_ID_789': { id: 'GOVT_ID_789', role: 'govt', password: 'password' },
    '9876543210': { id: '9876543210', role: 'citizen' } 
};

const initialDailyEntries = {
    'SHOP123': [
        { id: 'de1', billNumber: 'B001', billAmount: 150, customerPhone: '9876543210' },
        { id: 'de2', billNumber: 'B002', billAmount: 250, customerPhone: '' },
    ]
};


// --- Helper & UI Components ---

const Notification = ({ message, type, onClear }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClear();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);

    const baseStyle = "fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-semibold z-50 transition-all duration-300";
    const typeStyles = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <div className={`${baseStyle} ${typeStyles[type]}`}>
            {message}
        </div>
    );
};

const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start space-x-4">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const Header = ({ user, onLoginClick, onLogout, setView }) => (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
                <svg className="h-10 w-10" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 25C141.421 25 175 58.5786 175 100C175 141.421 141.421 175 100 175C58.5786 175 25 141.421 25 100C25 58.5786 58.5786 25 100 25Z" fill="#E0E7FF" /><path d="M100 35C135.9 35 165 64.1 165 100C165 135.9 135.9 165 100 165C64.1 165 35 135.9 35 100C35 64.1 64.1 35 100 35Z" stroke="#374151" strokeWidth="4" /><path d="M90 115C90 120.523 85.5228 125 80 125C74.4772 125 70 120.523 70 115C70 109.477 74.4772 105 80 105C85.5228 105 90 109.477 90 115Z" fill="#374151" /><path d="M130 115C130 120.523 125.523 125 120 125C114.477 125 110 120.523 110 115C110 109.477 114.477 105 120 105C125.523 105 130 109.477 130 115Z" fill="#374151" /><path d="M100 130C108.284 130 115 123.284 115 115H85C85 123.284 91.7157 130 100 130Z" fill="#4F46E5" /><path d="M70 95C70 86.7157 76.7157 80 85 80H115C123.284 80 130 86.7157 130 95V100H70V95Z" fill="#4B5563" /><path d="M100 90C102.761 90 105 87.7614 105 85C105 82.2386 102.761 80 100 80C97.2386 80 95 82.2386 95 85C95 87.7614 97.2386 90 100 90Z" fill="#F9FAFB" /></svg>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight">GST Honesty Portal</h1>
            </div>
            <div className="flex items-center space-x-2">
                {user ? (
                    <>
                        {user.role === 'citizen' && <button onClick={() => setView('citizenDashboard')} className="bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 text-sm flex items-center space-x-2"><User size={16}/><span>My Dashboard</span></button>}
                        <button onClick={onLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 text-sm">Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => onLoginClick('citizen')} className="bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 text-sm flex items-center space-x-2"><User size={16}/><span>Citizen</span></button>
                        <button onClick={() => onLoginClick('shop')} className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 text-sm flex items-center space-x-2"><Building size={16}/><span>Shop</span></button>
                        <button onClick={() => onLoginClick('govt')} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-900 text-sm flex items-center space-x-2"><UserCog size={16}/><span>Govt</span></button>
                    </>
                )}
            </div>
        </div>
    </header>
);

// --- Page/View Components ---

const AppleStyleLandingPage = ({ setView }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => { setIsVisible(true); }, []);
    const StatItem = ({ value, label, delay }) => (<div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: delay }}><p className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">{value}</p><p className="text-sm md:text-base text-gray-400 mt-2">{label}</p></div>);
    return (<div className="w-full bg-black text-white overflow-hidden"><style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap'); .font-inter { font-family: 'Inter', sans-serif; }`}</style><div className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative font-inter"><div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-black to-black z-0"></div><div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div><div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div><main className="z-10 flex flex-col items-center"><div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}><h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-tight">Every Bill. <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">A Nation's Strength.</span></h1><p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">Join a nationwide movement for financial integrity. Your single action of uploading a bill strengthens our economy and ensures every rupee contributes to India's growth.</p></div><div className={`mt-10 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}><button onClick={() => setView('upload')} className="group bg-white text-black font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 flex items-center">Upload Your Bill <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" /></button></div></main></div><section className="py-20 md:py-32 bg-black relative z-10"><div className="max-w-5xl mx-auto px-4 text-center"><h2 className={`text-4xl md:text-5xl font-bold transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>The Hidden Cost of Evasion</h2><p className={`mt-4 text-lg text-gray-400 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>In the last fiscal year alone, the scale of detected GST evasion was staggering. This is not just a number; it's a measure of lost potential for public services, infrastructure, and national development.</p><div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"><StatItem value="₹2.23" label="Lakh Crores Evaded" delay="900ms" /><StatItem value="1.5 Cr+" label="Registered Taxpayers" delay="1100ms" /><StatItem value="1 Action" label="Can Make a Difference" delay="1300ms" /></div><p className="text-xs text-gray-600 mt-16">Source: Data shared by Ministry of Finance in Lok Sabha, 2025.</p></div></section></div>);
};

const BillUploadForm = ({ handleSubmit, setView, user }) => {
    const [formData, setFormData] = useState({ shopName: '', city: '', billAmount: '', billDate: '', registered: 'yes', mobileNumber: '' });
    const [billImage, setBillImage] = useState(null);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const fileInputRef = useRef(null);
    const handleSendOtp = () => { if (formData.mobileNumber.length !== 10 || !/^\d{10}$/.test(formData.mobileNumber)) { setError('Please enter a valid 10-digit mobile number.'); return; } setError(''); setOtpSent(true); };
    const onFormSubmit = (e) => { e.preventDefault(); if (!billImage) { setError('Bill image is mandatory.'); return; } if (parseFloat(formData.billAmount) <= 500) { setError('Bill amount must be greater than ₹500.'); return; } if (!otp) { setError('Please enter the OTP.'); return; } setError(''); handleSubmit({ ...formData, billAmount: parseFloat(formData.billAmount), billImage: billImage.name, submittedBy: user ? user.id : formData.mobileNumber }); };
    return (<div className="w-full max-w-2xl mx-auto px-4 py-8"><div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"><div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900 dark:text-white">Report a Bill</h2><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Your submission helps ensure tax compliance. If you're new, this will also register you.</p></div>{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}<form onSubmit={onFormSubmit} className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Bill Photo (Mandatory)</label><div onClick={() => fileInputRef.current.click()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer"><div className="space-y-1 text-center"><UploadCloud className="mx-auto h-12 w-12 text-gray-400" />{billImage ? <p className="text-sm text-green-600 font-semibold">{billImage.name}</p> : <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload an image</p>}<input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={(e) => setBillImage(e.target.files[0])} required /></div></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><label htmlFor="shopName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Shop Name</label><input type="text" id="shopName" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg" required /></div><div><label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-200">City</label><input type="text" id="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg" required /></div><div><label htmlFor="billAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bill Amount (₹)</label><input type="number" id="billAmount" value={formData.billAmount} onChange={e => setFormData({...formData, billAmount: e.target.value})} className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg" placeholder="Must be > 500" required /></div><div><label htmlFor="billDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bill Date</label><input type="date" id="billDate" value={formData.billDate} onChange={e => setFormData({...formData, billDate: e.target.value})} className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg" required /></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Is the dealer GST registered?</label><fieldset className="mt-2 text-gray-700 dark:text-gray-200"><div className="flex items-center space-x-4"><div className="flex items-center"><input id="reg_yes" name="registered" type="radio" value="yes" checked={formData.registered === 'yes'} onChange={e => setFormData({...formData, registered: e.target.value})} className="h-4 w-4 text-indigo-600" /><label htmlFor="reg_yes" className="ml-2">Yes</label></div><div className="flex items-center"><input id="reg_no" name="registered" type="radio" value="no" checked={formData.registered === 'no'} onChange={e => setFormData({...formData, registered: e.target.value})} className="h-4 w-4" /><label htmlFor="reg_no" className="ml-2">No</label></div><div className="flex items-center"><input id="reg_unsure" name="registered" type="radio" value="unsure" checked={formData.registered === 'unsure'} onChange={e => setFormData({...formData, registered: e.target.value})} className="h-4 w-4" /><label htmlFor="reg_unsure" className="ml-2">Not Sure</label></div></div></fieldset></div><div><label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Your Mobile Number</label><div className="flex space-x-2 mt-1"><input type="tel" id="mobileNumber" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg" placeholder="10-digit number" required disabled={otpSent} /><button type="button" onClick={handleSendOtp} disabled={otpSent} className="py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium disabled:bg-gray-400">{otpSent ? 'OTP Sent' : 'Send OTP'}</button></div></div>{otpSent && <div><label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Enter OTP</label><input type="text" id="otp" value={otp} onChange={e => setOtp(e.target.value)} className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg" placeholder="Enter 6-digit OTP" required /></div>}<div className="flex items-center space-x-4"><button type="submit" className="w-full py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium">Submit Bill</button><button type="button" onClick={() => setView('landing')} className="w-full py-3 px-4 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 font-medium">Cancel</button></div></form></div></div>);
};

const ResultScreen = ({ setView }) => {
    const token = `GSTHP-${Date.now().toString().slice(-6)}`;
    return (<div className="w-full max-w-2xl mx-auto px-4 py-8"><div className={`bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center`}><ShieldCheck className="mx-auto h-16 w-16 text-green-500" /><h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Thank You For Your Submission!</h2><p className="mt-4 text-gray-600 dark:text-gray-300">Your contribution helps build a more transparent India.</p><div className="mt-6 bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg"><p className="text-md text-gray-800 dark:text-gray-200">Your Submission Token Number is:</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{token}</p></div><button onClick={() => setView('landing')} className="mt-8 w-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold py-3 px-6 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900">Return to Dashboard</button></div></div>);
};

const LoginPage = ({ setView, onLogin, role }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const roleConfig = { citizen: { label: 'Mobile Number', placeholder: 'e.g., 9876543210', button: 'bg-teal-500 hover:bg-teal-600' }, shop: { label: 'Shop Code', placeholder: 'e.g., SHOP123', button: 'bg-orange-500 hover:bg-orange-600' }, govt: { label: 'Govt ID', placeholder: 'e.g., GOVT_ID_789', button: 'bg-gray-800 hover:bg-gray-900' },};
    const { label, placeholder, button } = roleConfig[role];
    const handleOtpRequest = () => { if (identifier.length !== 10 || !/^\d{10}$/.test(identifier)) { setError('Please enter a valid 10-digit mobile number.'); return; } setError(''); setOtpSent(true); };
    const handleLogin = (e) => { e.preventDefault(); const user = onLogin(identifier, role === 'citizen' ? otp : password, role); if (!user) { setError('Invalid credentials or role mismatch.'); } };
    return (<div className="w-full max-w-md mx-auto px-4 py-8"><div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"><h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">Login as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>{error && <p className="text-red-500 text-center mt-4">{error}</p>}<form onSubmit={handleLogin} className="mt-8 space-y-6">{role === 'citizen' ? (<><div><label htmlFor="identifier" className="dark:text-gray-200">{label}</label><div className="flex space-x-2 mt-1"><input id="identifier" type="tel" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={placeholder} required disabled={otpSent} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><button type="button" onClick={handleOtpRequest} disabled={otpSent} className="py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium disabled:bg-gray-400">{otpSent ? 'Sent' : 'Send OTP'}</button></div></div>{otpSent && (<div><label htmlFor="otp" className="dark:text-gray-200">Enter OTP</label><input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Enter 6-digit OTP" /></div>)}</>) : (<><div><label htmlFor="identifier" className="dark:text-gray-200">{label}</label><input id="identifier" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={placeholder} required className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div><div><label htmlFor="password"  className="dark:text-gray-200">Password</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" required className="w-full mt-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div></>)}<div className="flex items-center space-x-4"><button type="submit" className={`w-full py-3 rounded-lg text-white font-medium ${button}`}>Login</button><button type="button" onClick={() => setView('landing')} className="w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 font-medium dark:text-white">Cancel</button></div></form></div></div>);
};

const CitizenDashboard = ({ user, bills }) => {
    const [rewardUpi, setRewardUpi] = useState('');
    const [claimingBillId, setClaimingBillId] = useState(null);
    const mySubmissions = bills.filter(b => b.submittedBy === user.id);
    const awards = mySubmissions.filter(b => b.awarded).length;
    const handleClaim = (billId) => { if (claimingBillId === billId) { alert(`Reward for UPI ID ${rewardUpi} is being processed!`); setClaimingBillId(null); setRewardUpi(''); } else { setClaimingBillId(billId); } };
    return (<div className="w-full max-w-7xl mx-auto px-4 py-8"><h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Dashboard</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><StatCard icon={<FileText size={24}/>} title="Total Bills Submitted" value={mySubmissions.length} color="bg-blue-100 dark:bg-blue-900/50" /><StatCard icon={<Award size={24}/>} title="Awards Received" value={awards} color="bg-yellow-100 dark:bg-yellow-900/50" /></div><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-lg"><h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">My Submission History</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100 dark:bg-gray-700"><tr className="text-gray-600 dark:text-gray-300"><th className="p-3">Date</th><th className="p-3">Shop Name</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Award</th></tr></thead><tbody className="text-gray-700 dark:text-gray-200">{mySubmissions.length > 0 ? mySubmissions.map(bill => (<tr key={bill.id} className="border-b dark:border-gray-700"><td className="p-3">{new Date(bill.timestamp).toLocaleDateString()}</td><td className="p-3">{bill.shopName}</td><td className="p-3">₹{bill.billAmount.toLocaleString('en-IN')}</td><td className="p-3">{bill.registered ? <span className="text-green-600">Registered</span> : <span className="text-red-600">Unregistered</span>}</td><td className="p-3">{bill.awarded ? (<div><p className="text-yellow-500 font-semibold flex items-center"><Award className="mr-2"/> Congrats!</p>{claimingBillId === bill.id && (<div className="mt-2 flex space-x-2"><input type="text" value={rewardUpi} onChange={e => setRewardUpi(e.target.value)} placeholder="Enter UPI ID" className="p-1 border rounded text-xs w-full dark:bg-gray-700 dark:border-gray-600" /><button onClick={() => handleClaim(bill.id)} className="bg-green-500 text-white px-2 py-1 text-xs rounded">Send</button></div>)}<button onClick={() => handleClaim(bill.id)} className="text-blue-500 text-xs mt-1">{claimingBillId === bill.id ? 'Submit' : 'Claim Reward'}</button></div>) : 'No'}</td></tr>)) : <tr><td colSpan="5" className="p-3 text-center text-gray-500">You have not submitted any bills yet.</td></tr>}</tbody></table></div></div></div>);
};

const ShopDashboard = ({ user, bills, onJustify, dailyEntries, onAddEntry }) => {
    const [showJustifyModal, setShowJustifyModal] = useState(false);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [justification, setJustification] = useState('');
    const [selectedBillId, setSelectedBillId] = useState(null);
    const [dailyEntryData, setDailyEntryData] = useState({ billNumber: '', billAmount: '', customerPhone: '' });
    const flaggedBills = bills.filter(b => b.shopName === user.shopName && !b.registered);
    const handleOpenJustifyModal = (billId) => { setSelectedBillId(billId); setJustification(''); setShowJustifyModal(true); };
    const handleSubmitJustification = () => { onJustify(selectedBillId, justification); setShowJustifyModal(false); };
    const handleDailyEntrySubmit = (e) => { e.preventDefault(); onAddEntry(user.id, dailyEntryData); setShowEntryModal(false); setDailyEntryData({ billNumber: '', billAmount: '', customerPhone: '' }); };
    return (<div className="w-full max-w-7xl mx-auto px-4 py-8"><h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Vendor Dashboard: {user.shopName}</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><StatCard icon={<AlertTriangle size={24}/>} title="Warnings Received" value={user.warnings} color="bg-yellow-100 dark:bg-yellow-900/50" /><StatCard icon={<DollarSign size={24}/>} title="Penalties Applied" value={`₹${user.penalties.toLocaleString('en-IN')}`} color="bg-red-100 dark:bg-red-900/50" /><div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center"><h3 className="text-lg font-semibold text-gray-800 dark:text-white">Bill-wise Entry</h3><p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">Upload individual bill entries for your records and compliance.</p><button onClick={() => setShowEntryModal(true)} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 text-sm">Add Bill Entry</button></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-lg"><h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Flagged Bills for Your Review</h3><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100 dark:bg-gray-700"><tr className="text-gray-600 dark:text-gray-300"><th className="p-3">Date</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody className="text-gray-700 dark:text-gray-200">{flaggedBills.length > 0 ? flaggedBills.map(bill => (<tr key={bill.id} className="border-b dark:border-gray-700"><td className="p-3">{new Date(bill.timestamp).toLocaleDateString()}</td><td className="p-3">₹{bill.billAmount.toLocaleString('en-IN')}</td><td className="p-3">{bill.justification ? <span className="text-green-600 font-semibold">Justified</span> : <span className="text-red-600 font-semibold">Pending</span>}</td><td className="p-3">{!bill.justification && <button onClick={() => handleOpenJustifyModal(bill.id)} className="bg-blue-500 text-white text-xs py-1 px-3 rounded-md hover:bg-blue-600">Justify</button>}</td></tr>)) : <tr><td colSpan="4" className="p-3 text-center text-gray-500">No flagged bills found.</td></tr>}</tbody></table></div></div><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-lg"><h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Bill Entry History</h3><div className="overflow-x-auto h-48"><table className="w-full text-sm text-left"><thead className="bg-gray-100 dark:bg-gray-700"><tr className="text-gray-600 dark:text-gray-300"><th className="p-3">Bill No.</th><th className="p-3">Amount (₹)</th><th className="p-3">Customer Phone</th></tr></thead><tbody className="text-gray-700 dark:text-gray-200">{dailyEntries[user.id] && dailyEntries[user.id].length > 0 ? dailyEntries[user.id].map(entry => (<tr key={entry.id} className="border-b dark:border-gray-700"><td className="p-3">{entry.billNumber}</td><td className="p-3">{entry.billAmount.toLocaleString('en-IN')}</td><td className="p-3">{entry.customerPhone || 'N/A'}</td></tr>)) : <tr><td colSpan="3" className="p-3 text-center text-gray-500">No entries submitted.</td></tr>}</tbody></table></div></div></div><Modal show={showJustifyModal} onClose={() => setShowJustifyModal(false)} title="Submit Justification"><textarea value={justification} onChange={(e) => setJustification(e.target.value)} className="w-full p-2 border rounded-md h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Explain why this bill was flagged..."></textarea><button onClick={handleSubmitJustification} className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Submit</button></Modal><Modal show={showEntryModal} onClose={() => setShowEntryModal(false)} title="Add Bill Entry"><form onSubmit={handleDailyEntrySubmit} className="space-y-4"><div><label className="dark:text-gray-200">Bill Number</label><input type="text" value={dailyEntryData.billNumber} onChange={e => setDailyEntryData({...dailyEntryData, billNumber: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div><div><label className="dark:text-gray-200">Bill Amount (₹)</label><input type="number" value={dailyEntryData.billAmount} onChange={e => setDailyEntryData({...dailyEntryData, billAmount: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div><div><label className="dark:text-gray-200">Customer Phone (Optional)</label><input type="tel" value={dailyEntryData.customerPhone} onChange={e => setDailyEntryData({...dailyEntryData, customerPhone: e.target.value})} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div><button type="submit" className="w-full mt-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Entry</button></form></Modal></div>);
};

const GovtDashboard = ({ stats, bills, users, onUpdateUser, onAwardCitizen }) => {
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [penaltyAmount, setPenaltyAmount] = useState(5000);
    const [penaltyTarget, setPenaltyTarget] = useState(null);
    const [expandedVendor, setExpandedVendor] = useState(null);
    const topVendors = useMemo(() => { const counts = bills.reduce((acc, bill) => { if (!bill.registered) { acc[bill.shopName] = (acc[bill.shopName] || 0) + 1; } return acc; }, {}); return Object.entries(counts).sort(([,a],[,b]) => b-a).slice(0, 5); }, [bills]);
    
    const handleAction = (shopName, action) => {
        const userEntry = Object.entries(users).find(([, u]) => u.shopName === shopName);
        if (!userEntry) { alert("Shop user not found!"); return; }
        const [userId, user] = userEntry;
        if (action === 'warn') { onUpdateUser(userId, { ...user, warnings: (user.warnings || 0) + 1 }); } 
        else if (action === 'penalize') { setPenaltyTarget({ userId, user }); setShowPenaltyModal(true); }
    };
    
    const submitPenalty = () => {
        const { userId, user } = penaltyTarget;
        onUpdateUser(userId, { ...user, penalties: (user.penalties || 0) + parseFloat(penaltyAmount) });
        setShowPenaltyModal(false);
        setPenaltyAmount(5000);
        setPenaltyTarget(null);
    };

    return (<div className="w-full max-w-7xl mx-auto px-4 py-8"><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-gray-900 dark:text-white">Government Analytics Dashboard</h2></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"><StatCard icon={<FileText size={24}/>} title="Total Bills Uploaded" value={stats.totalBills.toLocaleString('en-IN')} color="bg-blue-100 dark:bg-blue-900/50" /><StatCard icon={<ShieldAlert size={24}/>} title="Suspicious Bills" value={`${stats.unregistered.toLocaleString('en-IN')} (${stats.suspiciousPercent}%)`} color="bg-red-100 dark:bg-red-900/50" /><StatCard icon={<IndianRupee size={24}/>} title="Total Bill Value" value={`₹${(stats.totalAmount / 10000000).toFixed(2)} Cr`} color="bg-yellow-100 dark:bg-yellow-900/50" /><StatCard icon={<Building size={24}/>} title="Vendors with Complaints" value={topVendors.length} color="bg-purple-100 dark:bg-purple-900/50" /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-lg"><h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Vendors with Highest Complaints</h3><ul className="space-y-2">{topVendors.map(([name, count]) => <li key={name} className="bg-gray-50 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200"><div className="flex justify-between items-center p-2 "><div className="flex items-center"><span>{name}</span><span className="ml-2 font-bold bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">{count} reports</span></div><div className="space-x-2 flex items-center"><button onClick={() => handleAction(name, 'warn')} className="bg-yellow-500 text-white text-xs py-1 px-2 rounded hover:bg-yellow-600">Warn</button><button onClick={() => handleAction(name, 'penalize')} className="bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600">Penalize</button><button onClick={() => setExpandedVendor(expandedVendor === name ? null : name)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronDown size={16} className={`transition-transform ${expandedVendor === name ? 'rotate-180' : ''}`} /></button></div></div>{expandedVendor === name && (<div className="p-2 border-t border-gray-200 dark:border-gray-600 text-xs">{bills.filter(b => b.shopName === name && !b.registered).map(bill => (<div key={bill.id} className="flex justify-between items-center py-1"><span>Bill from {new Date(bill.timestamp).toLocaleDateString()} for ₹{bill.billAmount}</span>{!bill.awarded && bill.submittedBy && <button onClick={() => onAwardCitizen(bill.id)} className="bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600">Award Citizen</button>}</div>))}</div>)}</li>)}</ul></div><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-lg"><h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Submissions</h3><div className="overflow-y-auto h-64"><ul className="space-y-2">{[...bills].reverse().slice(0, 10).map(b => <li key={b.id} className={`p-2 rounded-md text-sm flex justify-between ${b.registered ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}><span>{b.shopName}, {b.city}</span><span className="font-semibold">₹{b.billAmount.toLocaleString('en-IN')}</span></li>)}</ul></div></div></div><Modal show={showPenaltyModal} onClose={() => setShowPenaltyModal(false)} title={`Apply Penalty to ${penaltyTarget?.user.shopName}`}><div className="space-y-4"><label className="dark:text-gray-200">Penalty Amount (₹)</label><input type="number" value={penaltyAmount} onChange={e => setPenaltyAmount(e.target.value)} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><button onClick={submitPenalty} className="w-full mt-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Apply Penalty</button></div></Modal></div>);
};


// --- Main App Component ---
export default function App() {
    const [view, setView] = useState('landing');
    const [bills, setBills] = useState(initialBills);
    const [users, setUsers] = useState(initialUsers);
    const [dailyEntries, setDailyEntries] = useState(initialDailyEntries);
    const [user, setUser] = useState(null);
    const [loginRole, setLoginRole] = useState(null);
    const [theme, setTheme] = useState('light');
    const [notification, setNotification] = useState(null);

    const stats = useMemo(() => { const totalBills = bills.length; const totalAmount = bills.reduce((sum, bill) => sum + bill.billAmount, 0); const registered = bills.filter(b => b.registered).length; const unregistered = bills.filter(b => !b.registered).length; const potentialLeakage = bills.filter(b => !b.registered).reduce((sum, bill) => sum + bill.billAmount, 0); const suspiciousPercent = totalBills > 0 ? ((unregistered / totalBills) * 100).toFixed(1) : 0; return { totalBills, totalAmount, registered, unregistered, potentialLeakage, suspiciousPercent }; }, [bills]);

    const handleBillSubmit = (formData) => {
        const { mobileNumber } = formData;
        if (!users[mobileNumber]) { setUsers(prev => ({ ...prev, [mobileNumber]: { id: mobileNumber, role: 'citizen' } })); }
        const newBill = { id: `b${bills.length + 1}`, ...formData, registered: formData.registered === 'yes', timestamp: new Date().toISOString(), justification: null, awarded: false };
        setBills(prev => [...prev, newBill]);
        setView('result');
    };

    const handleLoginClick = (role) => { setLoginRole(role); setView('login'); };

    const handleLogin = (identifier, secret, role) => {
        const foundUser = users[identifier];
        if (role === 'citizen') {
            if (foundUser && foundUser.role === 'citizen' && secret.length > 0) { setUser({ ...foundUser, id: identifier }); setView('citizenDashboard'); return foundUser; }
        } else {
            if (foundUser && foundUser.role === role && foundUser.password === secret) { setUser({ ...foundUser, id: identifier }); if (role === 'govt') { setTheme('dark'); } setView(role === 'shop' ? 'shopDashboard' : 'govtDashboard'); return foundUser; }
        }
        return null;
    };

    const handleLogout = () => { setUser(null); setTheme('light'); setView('landing'); };
    const handleJustify = (billId, justification) => { setBills(prevBills => prevBills.map(bill => bill.id === billId ? { ...bill, justification } : bill)); };
    const handleUpdateUser = (userId, updatedUserData) => { setUsers(prev => ({ ...prev, [userId]: updatedUserData })); setNotification({ type: 'success', message: 'Shopkeeper status updated!' }); };
    const handleAddDailyEntry = (shopId, entryData) => {
        const newEntry = { id: `de${(dailyEntries[shopId]?.length || 0) + 1}`, ...entryData };
        setDailyEntries(prev => ({ ...prev, [shopId]: [...(prev[shopId] || []), newEntry] }));
        setNotification({ type: 'success', message: 'Bill entry added successfully!' });
    };
    const handleAwardCitizen = (billId) => {
        setBills(prevBills => prevBills.map(bill => bill.id === billId ? { ...bill, awarded: true } : bill));
        setNotification({ type: 'success', message: 'Reward has been granted to the citizen!' });
    };

    const renderView = () => {
        if (user && users[user.id]) {
            const currentUserData = users[user.id];
            if (currentUserData.role === 'shop') return <ShopDashboard user={currentUserData} bills={bills} onJustify={handleJustify} dailyEntries={dailyEntries} onAddEntry={handleAddDailyEntry} />;
            if (currentUserData.role === 'govt') return <GovtDashboard stats={stats} bills={bills} users={users} onUpdateUser={handleUpdateUser} onAwardCitizen={handleAwardCitizen} />;
            if (currentUserData.role === 'citizen') {
                if (view === 'citizenDashboard') return <CitizenDashboard user={currentUserData} bills={bills} />;
                if (view === 'upload') return <BillUploadForm handleSubmit={handleBillSubmit} setView={setView} user={currentUserData} />;
                return <CitizenDashboard user={currentUserData} bills={bills} />;
            }
        }
        switch (view) {
            case 'upload': return <BillUploadForm handleSubmit={handleBillSubmit} setView={setView} user={user} />;
            case 'result': return <ResultScreen setView={setView} />;
            case 'login': return <LoginPage setView={setView} onLogin={handleLogin} role={loginRole} />;
            case 'landing': default: return <AppleStyleLandingPage setView={setView} />;
        }
    };

    return (<div className={theme}><div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans antialiased">{notification && <Notification message={notification.message} type={notification.type} onClear={() => setNotification(null)} />}<Header user={user} onLoginClick={handleLoginClick} onLogout={handleLogout} setView={setView} /><main>{renderView()}</main><footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-auto">© {new Date().getFullYear()} GST Honesty Portal. A citizen-powered initiative.</footer></div></div>);
}
