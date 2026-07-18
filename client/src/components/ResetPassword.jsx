import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams(); // 👈 Pulls the resetToken directly from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);

    try {
      // ✅ Call your PUT route on port 5000 with the token parameter
      const response = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login'); // Redirect to login page on success
        }, 3000);
      } else {
        setError(data.message || 'Failed to update credentials.');
      }
    } catch (err) {
      setError('Failed to connect to the authorization server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">New Password Setup</h2>
          <p className="text-slate-500 text-sm">Create secure entry credentials for your account.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold">
            <AlertTriangle className="shrink-0 text-rose-500" size={18} />
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm text-center font-semibold">
            <h4>Password Updated!</h4>
            <p className="text-xs font-normal mt-1 text-slate-600">Redirecting you back to authentication node...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none bg-transparent text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full outline-none bg-transparent text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Re-keying accounts...' : 'Apply New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}