import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Button from './Button';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay for realism
    setTimeout(() => {
      // Hardcoded credentials check
      if (email === 'admin@gmail.com' && password === 'admin@2806') {
        onLogin();
      } else {
        setError('Invalid credentials. Please check your email and password.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left Side - Branding (Matches Screenshot Style) */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-900 flex-col justify-center px-12 xl:px-24 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://picsum.photos/1200/1600?grayscale" 
            alt="Library Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-brand-900/90 mix-blend-multiply" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-brand-accent font-bold text-xl tracking-wide">IACG</h2>
            <p className="text-xs uppercase tracking-widest text-gray-300">Multimedia College</p>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold leading-tight">
              Student Career <br />
              Analysis
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Enter your credentials to access the administrative dashboard. 
              Manage student assessments, view psychometric reports, and 
              guide future career paths effectively.
            </p>
          </div>

          {/* Pagination dots simulation from screenshot */}
          <div className="flex space-x-2 pt-8">
             <div className="w-3 h-3 rounded-full bg-brand-accent"></div>
             <div className="w-3 h-3 rounded-full bg-gray-600"></div>
             <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-brand-900">Admin Login</h2>
            <p className="text-gray-500">Please provide your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                <User size={16} />
                Admin Email
              </label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-900 focus:border-brand-900 outline-none transition-all placeholder:text-gray-400"
                placeholder="e.g. admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                <Lock size={16} />
                Password
              </label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-900 focus:border-brand-900 outline-none transition-all placeholder:text-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-4 text-base shadow-lg shadow-brand-900/20"
                isLoading={loading}
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              <p>Protected System. Authorized Access Only.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;