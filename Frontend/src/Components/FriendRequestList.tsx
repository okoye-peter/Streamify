import React, { useEffect, useState } from 'react'
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
    getIncomingFriendRequest,
    acceptFriendRequest,
    declineFriendRequest
} from "../libs/api.ts";
import { useDebounce } from '../hooks/useDebounce.ts';
import { SearchIcon, Loader2 } from 'lucide-react';
import { UserRoundCheck, MapPinIcon, UserX } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import { getLanguageFlag } from '../utils/HelperFunctions.tsx';
import toast from 'react-hot-toast';
import type { AppAxiosError, OutgoingRequest } from '../types/index.ts';

const FriendsList = () => {
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const debouncedSearch = useDebounce(search, 500);

    const {
        data,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['friends', debouncedSearch],
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            getIncomingFriendRequest({ pageParam: pageParam as number, search: debouncedSearch }),
        getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    });

    const acceptRequestMutation = useMutation({
        mutationFn: acceptFriendRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friendRequestCount'] });
            toast.success("Friend request accepted successfully.");
        },
        onError: (error: AppAxiosError) => {
            toast.error(error?.response?.data?.message || "Failed to accept friend request. Please try again.");
        }
    })

    const declineRequestMutation = useMutation({
        mutationFn: declineFriendRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['friendRequestCount'] });
            toast.success("Friend request declined successfully.");
        },
        onError: (error: AppAxiosError) => {
            toast.error(error?.response?.data?.message || "Failed to decline friend request. Please try again.");
        }

    })

    const totalRequest = data?.pages[0]?.totalRequest ?? 0;
    const incomingRequests = data?.pages.flatMap(page => page.incomingRequests) ?? [];

    useEffect(() => {
        if (totalRequest !== undefined) {
            queryClient.setQueryData(['friendRequestCount'], (old: number) => {
                // Only update if value actually changed
                return old !== totalRequest ? totalRequest : old;
            });
        }
    }, [totalRequest, queryClient]);


    return (
        <div>
            <div className="relative flex justify-center mb-4">
                <div className="relative w-1/2">

                    <input
                        type="text"
                        className="w-full p-4 pr-10 border rounded-full"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search friend requests..."
                    />
                    <SearchIcon
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLoading && debouncedSearch ? 'hidden' : 'inline'}`}
                    />
                    <Loader2
                        className={`absolute right-3 top-1/2 -translate-y-1/2 animate-spin ${isLoading && debouncedSearch ? 'inline' : 'hidden'}`}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                {data?.pages?.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                        {page?.incomingRequests?.map((friendRequest: OutgoingRequest) => (
                            typeof friendRequest.sender !== "string" && (
                                <div
                                    key={friendRequest._id}
                                    className="transition-all duration-300 card bg-base-200 hover:shadow-lg"
                                >
                                    <div className="p-5 space-y-4 card-body">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full avatar size-16">
                                                <img
                                                    src={friendRequest.sender.profilePicture || "/default-avatar.png"}
                                                    alt={friendRequest.sender.name}
                                                />
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold">{friendRequest.sender.name}</h3>
                                                {friendRequest.sender.location && (
                                                    <div className="flex items-center mt-1 text-xs opacity-70">
                                                        <MapPinIcon className="mr-1 size-3" />
                                                        {friendRequest.sender.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Languages with flags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="badge badge-secondary">
                                                {getLanguageFlag(friendRequest.sender.nativeLanguage)}
                                                Native:{" "}
                                                <span className="capitalize">
                                                    {friendRequest.sender.nativeLanguage}
                                                </span>
                                            </span>
                                            <span className="badge badge-outline">
                                                {getLanguageFlag(friendRequest.sender.learningLanguage)}
                                                Learning:{" "}
                                                <span className="capitalize">
                                                    {friendRequest.sender.learningLanguage}
                                                </span>
                                            </span>
                                        </div>

                                        {friendRequest.sender.bio && (
                                            <p className="text-sm opacity-70">{friendRequest.sender.bio}</p>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex justify-between gap-2 mt-2">
                                            <button
                                                className="text-center btn btn-primary"
                                                onClick={() => acceptRequestMutation.mutate(friendRequest._id)}
                                                disabled={
                                                    (acceptRequestMutation.isPending ||
                                                        declineRequestMutation.isPending) &&
                                                    acceptRequestMutation.variables === friendRequest._id
                                                }
                                            >
                                                {acceptRequestMutation.isPending &&
                                                    acceptRequestMutation.variables === friendRequest._id ? (
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <UserRoundCheck className="mr-2 size-4" />
                                                        Accept
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                className="text-center btn btn-error"
                                                onClick={() => declineRequestMutation.mutate(friendRequest._id)}
                                                disabled={
                                                    (acceptRequestMutation.isPending ||
                                                        declineRequestMutation.isPending) &&
                                                    declineRequestMutation.variables === friendRequest._id
                                                }
                                            >
                                                {declineRequestMutation.isPending &&
                                                    declineRequestMutation.variables === friendRequest._id ? (
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <UserX className="mr-2 size-4" />
                                                        Reject
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </React.Fragment>

                ))}

                {incomingRequests.length === 0 && !isLoading && (
                    <div className="h-[calc(100vh-200px)] flex justify-center items-center w-full">
                        <video
                            src="/assets/images/No Result Hint message.mp4"
                            className="w-fit rounded-full max-h-[40vh] object-contain"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    </div>
                )}
            </div>
        </div >
    );
};

export default FriendsList;
