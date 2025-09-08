import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useGetAuthUser from '../hooks/useGetAuthUser';
import { getStreamToken } from '../libs/api';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat, Channel as StreamChatChannel } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from '../Components/ChatLoader';
import VideoCallButton from '../Components/VideoCallButton';

const ChatPage = () => {
  const { id: friendId } = useParams();
  const STREAM_CHAT_API_KEY = import.meta.env.VITE_GET_STREAM_API_KEY;
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChatChannel | null>(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useGetAuthUser();
  const { data: tokenData } = useQuery({
    queryKey: ['getStreamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser // run after get authenticated user
  })


  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token) return;

      try {
        console.log('initializing stream chat....')

        const client = StreamChat.getInstance(STREAM_CHAT_API_KEY);
        await client.connectUser({
          id: authUser?._id,
          name: authUser?.name,
          image: authUser?.profilePicture
        }, tokenData?.token)

        // create a channel Id for both user to use same  channel id regardless of who initiate the chat
        const channelId = [authUser?._id, friendId].sort().join("-")

        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser?._id, friendId]
        })

        await currentChannel.watch();

        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.log('Error create stream chat channel: ', error)
        toast.error('Error creating Stream chat channel');
      } finally {
        setLoading(false);
      }
    }

    initChat()
  }, [tokenData, STREAM_CHAT_API_KEY, authUser, friendId])


  const handleVideoCall = () => {
    if(channel){
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text:   `I've started a video call. Join me here: ${callUrl}`
      })

      toast.success('Video call link sent successfully');
    }  
  }

  if (loading || !chatClient || !channel) return <ChatLoader />

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="relative w-full">
            <VideoCallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage;