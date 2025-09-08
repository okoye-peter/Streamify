import { generateStreamToken } from '../lib/stream-chat.js'

export const getStreamToken = async (req, res) => {
    try {
        const token  = await generateStreamToken(req.user.id);
        return res.status(200).json({ token });
    } catch (error) {
        console.log("Error getting stream token: ", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}