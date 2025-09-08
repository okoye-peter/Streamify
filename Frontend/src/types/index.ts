import { AxiosError } from "axios";

export interface registrationData {
  name: string;
  email: string;
  password: string;
}

export interface loginData {
  email: string;
  password: string;
}

export interface forgotPasswordData {
  email: string;
}

export interface resetPasswordData {
  password: string;
  token: string;
}

export interface onBoardingData {
  name: string;
  bio: string;
  profilePicture: string;
  nativeLanguage: string;
  learningLanguage: string;
  location: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  nativeLanguage?: string;
  learningLanguage?: string;
  location?: string;
  friends: string[]; // Array of User IDs
}

export interface FriendsResponse {
  data: User[];
  nextPage: number | null;
  hasMore: boolean;
  currentPage: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalFriends: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OutgoingRequest {
  createdAt: string;
  recipient: string | User;
  sender: string | User; // User ID of the sender
  status: string; // e.g., "pending", "accepted", "rejected"
  updatedAt: string;
  __v: number;
  _id: string;
}

export interface OutgoingRequestsResponse {
  data: OutgoingRequest[];
}


export interface ThemeState {
  theme: string
  setTheme: (newTheme: string) => void
}

export interface VideoCallButtonProps  {
  handleVideoCall: () => void; // ✅ explicitly typed
};

export interface ApiError {
  message: string;
}

export type AppAxiosError<T = ApiError> = AxiosError<T>;