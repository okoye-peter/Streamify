import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import useGetAuthUser from '../hooks/useGetAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../libs/api';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  Call as StreamVideoCall
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../Components/PageLoader.tsx";


const Call = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<StreamVideoCall | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const STREAM_API_KEY = import.meta.env.VITE_GET_STREAM_API_KEY;

  const { authUser, isLoading } = useGetAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ['streamVideoCallToken'],
    queryFn: getStreamToken,
    enabled: !!authUser

  })

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.name,
          image: authUser.profilePicture,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join  the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId, STREAM_API_KEY]);

  if (isLoading || isConnecting) return <PageLoader />;


  return (
    <div className="flex flex-col items-center justify-center h-screen py-3">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // redirect if user has left
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/friends");
    }
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};


export default Call