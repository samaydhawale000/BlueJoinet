'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const setToken =
    useAuthStore(
      (state) => state.setToken,
    );

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  async function login() {
    const response =
      await api.post(
        '/auth/login',
        {
          email,
          password,
        },
      );

    setToken(
      response.data.accessToken,
    );

    alert('Login Success');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 space-y-4">
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value,
            )
          }
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value,
            )
          }
        />

        <button
          className="bg-black text-white px-4 py-2"
          onClick={login}
        >
          Login
        </button>
      </div>
    </div>
  );
}