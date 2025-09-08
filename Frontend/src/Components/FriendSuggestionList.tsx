import React, { useState, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { getAuthUserOutgoingRequests, getSuggestedFriend, sendFriendRequest } from "../libs/api.ts";
import { useDebounce } from '../hooks/useDebounce.ts';
import { SearchIcon, Loader2, LoaderCircle } from 'lucide-react';
import type { FriendsResponse } from '../types/index.ts';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon } from "lucide-react";
import { getLanguageFlag } from '../utils/HelperFunctions.tsx';
import type { OutgoingRequestsResponse } from '../types/index.ts';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';
import type { AxiosError } from 'axios';


const FriendSuggestionList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [outgoingRequestIds, setOutgoingRequestIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 500);
  const { ref, inView } = useInView();

  const { data: outgoingRequestsData, isError: outGoingRequestHasError, error: outGoingError } =
    useQuery<OutgoingRequestsResponse, AxiosError<{ message: string }>>({
      queryKey: ['outgoingRequests'],
      queryFn: getAuthUserOutgoingRequests,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

    console.log('outgoingRequestsData' , outgoingRequestsData);

  useEffect(() => {
  if (outgoingRequestsData?.data) {
    const ids = new Set<string>(
      outgoingRequestsData.data.map(r =>
        typeof r.recipient === "string" ? r.recipient : r.recipient._id
      )
    );
    setOutgoingRequestIds(ids);
  }
}, [outgoingRequestsData]);

  useEffect(() => {
    if (outGoingRequestHasError) {
      toast.error(outGoingError?.response?.data?.message || "Failed to fetch outgoing requests. Please try again.");
    }
  }, [outGoingRequestHasError, outGoingError])

  // Infinite query for suggested friends
  const {
    data,
    isLoading: suggestedFriendsIsLoading,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<FriendsResponse>({
    queryKey: ['suggestedFriends', debouncedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getSuggestedFriend({
        pageParam: pageParam as number,
        search: debouncedSearch
      }),
    getNextPageParam: (lastPage) => {
      // More explicit check
      return lastPage?.pagination?.hasNextPage ? lastPage.nextPage : undefined;
    },
    enabled: true, // Explicitly enable
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] }),
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
        "Failed to send friend request. Please try again."
      );
    },
  });

  useEffect(() => {
    if (inView && data?.pages[data.pages.length - 1].pagination.hasNextPage && !suggestedFriendsIsLoading) {
      fetchNextPage();
    }
  }, [inView, data, fetchNextPage, suggestedFriendsIsLoading]);

  return (
    <>
      <div className="relative flex justify-center mb-4">
        <div className="relative w-1/2">
          <input
            type="text"
            className="w-full p-4 pr-10 border rounded-full"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people your may know..."
          />
          <SearchIcon
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-primary ${suggestedFriendsIsLoading && debouncedSearch ? 'hidden' : 'inline'}`}
          />
          <Loader2
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin ${suggestedFriendsIsLoading && debouncedSearch ? 'inline' : 'hidden'}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 my-6 overflow-y-auto md:grid-cols-3 h-[calc(100vh-250px)]">

        {data?.pages?.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.data?.map((user) => (
              <div
                key={user._id}
                className="transition-all duration-300 card bg-base-200 hover:shadow-lg h-fit"
              >
                <div className="p-5 space-y-4 card-body">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full avatar size-16">
                      <img src={user.profilePicture} alt={user.name} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      {user.location && (
                        <div className="flex items-center mt-1 text-xs opacity-70">
                          <MapPinIcon className="mr-1 size-3" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Languages with flags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="badge badge-secondary">
                      {getLanguageFlag(user.nativeLanguage)}
                      Native: <span className="capitalize">{user.nativeLanguage}</span>
                    </span>
                    <span className="badge badge-outline">
                      {getLanguageFlag(user.learningLanguage)}
                      Learning: <span className="capitalize">{user.learningLanguage}</span>
                    </span>
                  </div>

                  {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                  {/* Action button */}
                  <button
                    className={`btn w-full mt-2 ${outgoingRequestIds.has(user._id) ? "btn-disabled" : "btn-primary"
                      } `}
                    onClick={() => sendFriendRequestMutation.mutate(user._id)}
                    disabled={
                      outgoingRequestIds.has(user._id) ||
                      (sendFriendRequestMutation.isPending && sendFriendRequestMutation.variables === user._id)
                    }
                  >
                    {outgoingRequestIds.has(user._id) ? (
                      <>
                        <CheckCircleIcon className="mr-2 size-4" />
                        Request Sent
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="mr-2 size-4" />
                        Send Friend Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}

        {data?.pages[0].data.length === 0 && !suggestedFriendsIsLoading && (
          <div className="h-[40vh] flex justify-center items-center w-full md:col-span-3">
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

      <div ref={ref} className='h-1'>
        {inView && data?.pages[data.pages.length - 1].pagination.hasNextPage && !isFetchingNextPage &&
          <div className='flex justify-center py-3 md:col-span-3' >
            <LoaderCircle className='size-10 text-primary animate-spin' />
          </div>
        }
      </div>
    </>
  )
}

export default FriendSuggestionList