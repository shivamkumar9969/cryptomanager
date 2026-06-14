
// src/app/reset-password/ResetPasswordForm.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/lib/apiUrl';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        getApiUrl("/api/auth/reset-password"),
        { email, token, newPassword }
      );
      setMessage(res.data.message);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data as { message?: string })?.message || "Failed to reset password");
      } else {
        setError("Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Reset Password</h1>
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition ${loading
                ? 'bg-yellow-300 text-gray-700 cursor-not-allowed'
                : 'bg-yellow-500 text-gray-800 hover:bg-yellow-600'
              }`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && (
          <p className="mt-6 text-center text-green-400 font-semibold">{message}</p>
        )}
        {error && (
          <p className="mt-6 text-center text-red-400 font-semibold">{error}</p>
        )}
      </div>
    </div>
  );
}
