import React, { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '../hooks/useDebounce.ts';
import { SearchIcon, Loader2, LoaderCircle } from 'lucide-react';
import { getAuthUserFriend } from '../libs/api.ts';
import { getLanguageFlag } from '../utils/HelperFunctions.tsx';
import { Link } from 'react-router';
import type { User, FriendsResponse } from '../types/index.ts';
import { useInView } from 'react-intersection-observer';

const Friends = () => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const { ref, inView } = useInView();

    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery<Partial<FriendsResponse>>({
        queryKey: ['friends', debouncedSearch],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) =>
            getAuthUserFriend({
                pageParam: pageParam as number,
                search: debouncedSearch
            })
        ,
        getNextPageParam: (lastPage) => lastPage.nextPage ?? null,
    });

    useEffect(() => {
        if (inView && data?.pages[data.pages.length - 1]?.hasMore && !isLoading) {
            fetchNextPage();
        }
    }, [inView, data, fetchNextPage, isLoading]);

    return (
        <div>
            <div className="relative flex justify-center mb-4">
                <div className="relative w-1/2 py-6">

                    <input
                        type="text"
                        className="w-full p-4 pr-10 border rounded-full"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search friends..."
                    />
                    <SearchIcon
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLoading && debouncedSearch ? 'hidden' : 'inline'}`}
                    />
                    <Loader2
                        className={`absolute right-3 top-1/2 -translate-y-1/2 animate-spin ${isLoading && debouncedSearch ? 'inline' : 'hidden'}`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 my-6 overflow-y-auto md:grid-cols-3 h-[calc(100vh-250px)] px-6">

                {data?.pages?.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                        {page.data?.map((friend: User) => (
                            <div className="transition-shadow card bg-base-200 hover:shadow-md h-fit" key={friend._id}>
                                <div className="p-4 card-body">
                                    {/* USER INFO */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="avatar size-12">
                                            <img src={friend.profilePicture} alt={friend.name} />
                                        </div>
                                        <h3 className="font-semibold truncate">{friend.name}</h3>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className="text-xs badge badge-secondary">
                                            {getLanguageFlag(friend.nativeLanguage)}
                                            Native: {friend.nativeLanguage}
                                        </span>
                                        <span className="text-xs badge badge-outline">
                                            {getLanguageFlag(friend.learningLanguage)}
                                            Learning: {friend.learningLanguage}
                                        </span>
                                    </div>

                                    <Link to={`/chats/${friend._id}`} className="w-full btn btn-outline">
                                        Message
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}

                {data?.pages[0]?.data?.length === 0 && !isLoading && (
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
                {inView && hasNextPage && isFetchingNextPage &&
                    <div className='flex justify-center py-3 md:col-span-3' >
                        <LoaderCircle className='size-10 text-primary animate-spin' />
                    </div>
                }
            </div>
        </div>
    )
}

export default Friends