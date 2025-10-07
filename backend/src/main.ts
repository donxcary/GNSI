import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/appConfig";
import connectDB from "./config/databaseConfig";
import { errorHandler } from "./middlewares/errHandler.middleware";
import { HTTPSTATUS } from "./config/httpConfig";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import "./config/passportConfig";
import passport from "passport";
import authRoutes from "./routes/authRoute";
import userRoutes from "./routes/userRoute";
import isAuthenticated from "./middlewares/isAuth.middleware";
import workspaceRoutes from "./routes/workspaceRoute";
import memberRoute from "./routes/memberRoute";
import projectRoutes from "./routes/projectRoute";
import taskRouter from "./routes/taskRoute";


const path = require("path");
const app = express();
const BASE_PATH = config.BASE_PATH;


// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: "session",
        keys: [config.SESSION_SECRET],
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: "lax",
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        origin: config.FRONTEND_ORIGIN,
        credentials: true
    })
);


// Public landing page
app.get(`/`, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Public privacy policy page
app.get(`/privacy`, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/privacy.html"));
});

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoute);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRouter);



// Health check endpoint
app.get(
    "/health",
    asyncHandler(async (req: Request, res: Response) => {
        res.status(HTTPSTATUS.OK).json({
            status: "success",
            message: "API is healthy",
        });
    })
);

// Global Error Handler
app.use(errorHandler);

app.listen(config.PORT, async () => {
    console.log(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    await connectDB();
});