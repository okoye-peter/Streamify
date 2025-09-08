import { useState } from 'react'
import { ShipWheelIcon } from "lucide-react";
import { Link } from 'react-router';
import { Loader } from 'lucide-react';
import type { registrationData } from '../types/index.ts';
import { useRegisterUser } from '../hooks/useRegisterUser.ts';

const Registration = () => {
  const [signUpData, setSignUpData]  = useState<registrationData>({
    name: '',
    email: '',
    password: ''
  })

  const  { registrationMutation, isPending, error } = useRegisterUser();

  const handleRegistration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    registrationMutation(signUpData)
  }

  return (
    <div
      className="flex items-center justify-center h-screen p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="flex flex-col w-full max-w-5xl mx-auto overflow-hidden border shadow-lg border-primary/25 lg:flex-row bg-base-100 rounded-xl">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="flex flex-col w-full p-4 lg:w-1/2 sm:p-8">
          {/* LOGO */}
          <div className="flex items-center justify-start gap-2 mb-4">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Streamify
            </span>
          </div>

          {/* error message */}
          {error && (
            <div className="mb-4 alert alert-error">
              <span>{error.response?.data?.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleRegistration}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="w-full form-control">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full input input-bordered"
                      value={signUpData.name}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="w-full form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="w-full input input-bordered"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="w-full form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="w-full input input-bordered"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({
                          ...signUpData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="mt-1 text-xs opacity-70">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="justify-start gap-2 cursor-pointer label">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        required
                      />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline">
                          privacy policy
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="w-full btn btn-primary" type="submit">
                  {isPending ? (
                    <>
                      <Loader className="animate-spin" />
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="items-center justify-center hidden w-full lg:flex lg:w-1/2 bg-primary/10">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative max-w-sm mx-auto aspect-square">
              <img
                src="/public/assets/images/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="mt-6 space-y-3 text-center">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration