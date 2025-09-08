import { useState } from "react";
import useGetAuthUser from "../hooks/useGetAuthUser.ts"
import type { AppAxiosError, onBoardingData, User } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboard } from "../libs/api.ts";
import toast from "react-hot-toast";
import { LANGUAGES } from "../constant/index.ts";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  CameraIcon
} from "lucide-react";

const Onboarding = () => {
  const { authUser } = useGetAuthUser();
  const queryClient = useQueryClient();

  const [onboardingData, setOnboardingData] = useState<onBoardingData>({
    name: authUser?.name || "",
    profilePicture: authUser?.profilePicture || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
  })



  const { mutate: submitOnboarding, isPending } = useMutation<
  {status: boolean, user: User}, // success data type (or define your API response type here)
  AppAxiosError, // error type
  onBoardingData // variables type
>({
    mutationFn: onboard,
    onSuccess: () => {
      toast.success("User onboarded successfully!!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? "Something went wrong!");
    },
  })

  const handleSubmitOnboardFrom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(onboardingData);
    submitOnboarding(onboardingData);
  }

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setOnboardingData({ ...onboardingData, profilePicture: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-100">
      <div className="w-full max-w-3xl shadow-xl card bg-base-200">
        <div className="p-6 card-body sm:p-8">
          <h1 className="mb-6 text-2xl font-bold text-center sm:text-3xl">Complete Your Profile</h1>

          <form onSubmit={handleSubmitOnboardFrom} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="overflow-hidden rounded-full size-32 bg-base-300">
                {onboardingData.profilePicture ? (
                  <img
                    src={onboardingData.profilePicture}
                    alt="Profile Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="mr-2 size-4" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={onboardingData.name}
                onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                className="w-full input input-bordered"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={onboardingData.bio}
                onChange={(e) => setOnboardingData({ ...onboardingData, bio: e.target.value })}
                className="block w-full h-24 resize-none textarea textarea-bordered"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={onboardingData.nativeLanguage}
                  onChange={(e) => setOnboardingData({ ...onboardingData, nativeLanguage: e.target.value })}
                  className="w-full select select-bordered"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={onboardingData.learningLanguage}
                  onChange={(e) => setOnboardingData({ ...onboardingData, learningLanguage: e.target.value })}
                  className="w-full select select-bordered"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute z-50 transform -translate-y-1/2 top-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={onboardingData.location}
                  onChange={(e) => setOnboardingData({ ...onboardingData, location: e.target.value })}
                  className="w-full pl-10 input input-bordered"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="w-full btn btn-primary" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="mr-2 size-5" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="mr-2 animate-spin size-5" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Onboarding