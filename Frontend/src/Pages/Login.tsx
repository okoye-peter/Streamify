import React, { useState } from 'react'
import type { loginData } from '../types'
import { ShipWheelIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useAuthenticateUser } from '../hooks/useAuthenticateUser';

const Login = () => {
  const [loginData, setLoginData] = useState<loginData>({
    email: '',
    password: '',
  })

  const { authenticateUser, isLoading, error } = useAuthenticateUser();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    authenticateUser(loginData);
  }

  return (
    <div
      className="flex items-center justify-center h-screen p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="flex flex-col w-full max-w-5xl mx-auto overflow-hidden border shadow-lg border-primary/25 lg:flex-row bg-base-100 rounded-xl">
        {/* LOGIN FORM SECTION */}
        <div className="flex flex-col w-full p-4 lg:w-1/2 sm:p-8">
          {/* LOGO */}
          <div className="flex items-center justify-start gap-2 mb-4">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="mb-4 alert alert-error">
              <span>{error.response?.data?.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">
                    Sign in to your account to continue your language journey
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="w-full space-y-2 form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="w-full input input-bordered"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="w-full space-y-2 form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full input input-bordered"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="w-full btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-primary hover:underline">
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="items-center justify-center hidden w-full lg:flex lg:w-1/2 bg-primary/10">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative max-w-sm mx-auto aspect-square">
              <img src="/assets/images/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="mt-6 space-y-3 text-center">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login