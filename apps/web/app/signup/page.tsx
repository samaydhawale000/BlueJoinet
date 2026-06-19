'use client';

import { useState } from 'react';

import { api } from '@/lib/api';

export default function SignupPage() {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  async function signup() {
    await api.post(
      '/auth/signup',
      {
        email,
        password,
      },
    );

    alert(
      'Signup Successful',
    );
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
          onClick={signup}
        >
          Signup
        </button>
      </div>
    </div>
  );
}