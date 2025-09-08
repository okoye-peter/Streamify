import express from "express";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectToDatabase } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ ESM __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend to access cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/chats", chatRoutes);

// ✅ Production: serve React build
if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../../Frontend/dist");

  app.use(express.static(distPath));

  // Catch-all: send index.html for non-API routes
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDatabase();
});
