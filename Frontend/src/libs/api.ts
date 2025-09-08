import { axiosInstance } from "./axios.ts";
import type { onBoardingData, registrationData, loginData } from "../types/index.ts";
import type { FriendsResponse } from "../types/index.ts";
import { AxiosError } from "axios";

export const register = async (signUpData: registrationData) => {
    const response = await axiosInstance.post("/auth/register", signUpData);
    return response.data
}

export const login = async (loginData: loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data
}

export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data
}

export const getAuthUser = async () => {
    try {
        const response = await axiosInstance.get("/auth/me");
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) console.log('Error getting Auth User', error)
        return null;  // Return null if there's an error (e.g., user not authenticated)
    }
}

export const onboard = async (onboardData: onBoardingData) => {
    const response = await axiosInstance.post("/auth/onboarding", onboardData);
    return response.data
}

export const getAuthUserFriend = async ({
    pageParam = 1,
    search = "",
}: {
    pageParam?: number;
    search?: string;
}): Promise<FriendsResponse> => {
    const response = await axiosInstance.get<FriendsResponse>("/users/friends", {
        params: {
            page: pageParam,
            search,
        },
    });

    return response.data;
};

export const getSuggestedFriend = async ({
    pageParam = 1,
    search = "",
}: {
    pageParam?: number;
    search?: string;
}): Promise<FriendsResponse> => {
    const response = await axiosInstance.get<FriendsResponse>("/users/", {
        params: {
            page: pageParam,
            search,
        },
    });

    return response.data;
};

export const getAuthUserOutgoingRequests = async () => {
    const response = await axiosInstance.get("/users/outgoing-requests");
    return response.data;
}

export const sendFriendRequest = async (userId: string) => {
    const response = await axiosInstance.post(`/users/friend-requests/${userId}`);
    return response.data;
}

export const getIncomingFriendRequestsCount = async () => {
    const response = await axiosInstance.get("/users/friend-requests/count");
    return response.data;
}

export const getIncomingFriendRequest = async ({
    pageParam = 1,
    search = "",
}: {
    pageParam?: number;
    search?: string;
}) => {
    const response = await axiosInstance.get("/users/friend-requests", {
        params: {
            page: pageParam,
            search,
        },
    });
    return response.data;
}

export const acceptFriendRequest = async (requestId: string) => {
    const response = await axiosInstance.put(`/users/friend-requests/${requestId}/accept`);
    return response.data;
}

export const declineFriendRequest = async (requestId: string) => {
    const response = await axiosInstance.put(`/users/friend-requests/${requestId}/reject`);
    return response.data;
}

export const getStreamToken = async () => {
    const response = await axiosInstance.get('/chats/token');
    return response.data; 
}

