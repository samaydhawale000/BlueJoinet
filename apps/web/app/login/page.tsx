'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const { setToken } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.accessToken);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 space-y-4">
        <h1 className="text-2xl font-semibold">Sign in to BlueCall</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <input
          className="border p-2 w-full"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
        />

        <button
          className="bg-black text-white px-4 py-2 w-full disabled:opacity-50"
          onClick={login}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="underline text-black">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
