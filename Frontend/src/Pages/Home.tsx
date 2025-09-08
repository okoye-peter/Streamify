import React from 'react'
import FriendRequestList from '../Components/FriendRequestList.tsx'
import FriendSuggestionList from '../Components/FriendSuggestionList.tsx'
import { useQuery } from '@tanstack/react-query';
import { getIncomingFriendRequestsCount } from '../libs/api.ts';

const Home = () => {
  const [tab, setTab] = React.useState<'incomingRequest' | 'suggestion'>('incomingRequest');

  const { data:incomingRequestCount } = useQuery({
    queryKey: ['friendRequestCount'],
    queryFn: getIncomingFriendRequestsCount,
  })

  return (
    <div>
      <div className="flex justify-center px-4 pt-4 mb-4 gap-x-4">
        <button className={`
          py-2 text-sm px-4 flex items-center gap-x-1 
          ${tab === 'incomingRequest' ? 'border-b-2 border-primary font-medium' : 'opacity-70 hover:opacity-100  hover:bg-black/10 dark:hover:bg-white/10'}
          `}
          onClick={() => setTab('incomingRequest')}
        >
          <span>Friend Request</span>
          <section className="p-0.5 text-xs font-light text-center text-white bg-red-600 rounded-full min-h-5 min-w-5">{ incomingRequestCount ?? 0 }</section>
          </button>
        <button className={`
          py-2 text-sm  px-4
          ${tab === 'suggestion' ? 'border-b-2 border-primary font-medium' : 'opacity-70 hover:opacity-100   hover:bg-black/10 dark:hover:bg-white/10'}
          `} onClick={() => setTab('suggestion')}
        >
          Suggestion
        </button>
      </div>
      <div className="px-4 tab-contents">
        {tab == 'incomingRequest' && <FriendRequestList />}
        {tab == 'suggestion' && <FriendSuggestionList />}
      </div>
    </div>
  )
}

export default Home