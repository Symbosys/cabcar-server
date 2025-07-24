"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const middlewares_1 = require("./api/middlewares");
const config_1 = require("./config");
const path_1 = __importDefault(require("path"));
const user_route_1 = require("./api/routes/user.route");
// 🚀 Initialize express application
const app = (0, express_1.default)();
// 🛡️ Security and utility middlewares
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [config_1.ENV.FRONTEND_URL, config_1.ENV.FRONTEND_URL1],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use((0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, //⌛ 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
}));
// 🩺 Health check endpoint
app.get("/", (_, res) => {
    res.send("Hello World");
});
app.use("/api/auth", user_route_1.userRoute);
// ⚠️ Global error handling middleware
app.use(middlewares_1.errorMiddleware);
// 📤 Export the configured app
exports.default = app;
