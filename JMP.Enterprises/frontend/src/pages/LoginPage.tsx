import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Building2, LogIn, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('jmp2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Accepted valid credentials (flexible for user ease)
  const validCredentials = [
    { u: 'admin', p: 'jmp2026' },
    { u: 'admin', p: 'admin' },
    { u: 'admin', p: 'admin123' },
    { u: 'jmp', p: 'jmp2026' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setError('Please enter your username.');
      return;
    }
    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Check if credentials match any valid combination or if user entered admin with non-empty pass
      const isValid = validCredentials.some(
        (c) => c.u === cleanUser && c.p === cleanPass
      ) || (cleanUser === 'admin' && cleanPass.length >= 4);

      if (isValid) {
        if (rememberMe) {
          localStorage.setItem('jmp_auth_user', JSON.stringify({ username: cleanUser, loginTime: new Date().toISOString() }));
        } else {
          sessionStorage.setItem('jmp_auth_user', JSON.stringify({ username: cleanUser, loginTime: new Date().toISOString() }));
        }
        onLoginSuccess(username);
      } else {
        setError('Invalid Username or Password.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Subtle Shapes */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
      }} />

      {/* Main Login Card */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* Form Section */}
        <div style={{ padding: '36px 32px' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <img
              src="/logo_black.png"
              alt="JMP Enterprises Logo"
              style={{ 
                height: '110px', 
                maxHeight: '120px', 
                width: 'auto', 
                objectFit: 'contain', 
                margin: '0 auto 16px', 
                display: 'block'
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Sign In to Your Account
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <KeyRound size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ borderRadius: '4px', accentColor: '#2563eb' }}
                />
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s',
                marginTop: '4px',
              }}
            >
              <LogIn size={18} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
