import { StreamChat } from 'stream-chat';

const apiKey = process.env.GET_STREAM_API_KEY;
const apiSecret = process.env.GET_STREAM_API_SECRET;

if (!apiKey || !apiSecret) 
  console.error("Stream API key or secret is not defined in environment variables");

const chatClient = StreamChat.getInstance(apiKey, apiSecret);


export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData)
        return userData;
    } catch (error) {
        console.log("Error upserting stream users:", error)
    }
}

export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString();
        return chatClient.createToken(userIdStr);
    } catch (error) {
        console.log("Error generating Stream token: ", error )
    }
}