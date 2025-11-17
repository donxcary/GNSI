"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const appConfig_1 = require("./config/appConfig");
const databaseConfig_1 = __importDefault(require("./config/databaseConfig"));
const errHandler_middleware_1 = require("./middlewares/errHandler.middleware");
const httpConfig_1 = require("./config/httpConfig");
const asyncHandler_middleware_1 = require("./middlewares/asyncHandler.middleware");
require("./config/passportConfig");
const passport_1 = __importDefault(require("passport"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const isAuth_middleware_1 = __importDefault(require("./middlewares/isAuth.middleware"));
const workspaceRoute_1 = __importDefault(require("./routes/workspaceRoute"));
const memberRoute_1 = __importDefault(require("./routes/memberRoute"));
const projectRoute_1 = __importDefault(require("./routes/projectRoute"));
const taskRoute_1 = __importDefault(require("./routes/taskRoute"));
const roleRoute_1 = __importDefault(require("./routes/roleRoute"));
const path = require("path");
const app = (0, express_1.default)();
const BASE_PATH = appConfig_1.config.BASE_PATH;
// Serve static files from public directory
app.use(express_1.default.static(path.join(__dirname, "../public")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_session_1.default)({
    name: "session",
    keys: [appConfig_1.config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: "lax",
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cors_1.default)({
    origin: appConfig_1.config.FRONTEND_ORIGIN,
    credentials: true
}));
// Public landing page
app.get(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});
// Public privacy policy page
app.get(`/privacy`, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/privacy.html"));
});
app.use(`${BASE_PATH}/auth`, authRoute_1.default);
app.use(`${BASE_PATH}/user`, isAuth_middleware_1.default, userRoute_1.default);
app.use(`${BASE_PATH}/workspace`, isAuth_middleware_1.default, workspaceRoute_1.default);
app.use(`${BASE_PATH}/member`, isAuth_middleware_1.default, memberRoute_1.default);
app.use(`${BASE_PATH}/project`, isAuth_middleware_1.default, projectRoute_1.default);
app.use(`${BASE_PATH}/task`, isAuth_middleware_1.default, taskRoute_1.default);
app.use(`${BASE_PATH}/roles`, roleRoute_1.default);
// Health check endpoint
app.get("/health", (0, asyncHandler_middleware_1.asyncHandler)(async (req, res) => {
    res.status(httpConfig_1.HTTPSTATUS.OK).json({
        status: "success",
        message: "API is healthy",
    });
}));
// Global Error Handler
app.use(errHandler_middleware_1.errorHandler);
app.listen(appConfig_1.config.PORT, async () => {
    console.log(`Server is running on port ${appConfig_1.config.PORT} in ${appConfig_1.config.NODE_ENV} mode`);
    await (0, databaseConfig_1.default)();
});
