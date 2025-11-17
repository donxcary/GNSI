"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const memberController_1 = require("../controllers/memberController");
const memberRoute = (0, express_1.Router)();
memberRoute.post("/workspace/join/:inviteToken/join", memberController_1.joinWorkspaceController);
exports.default = memberRoute;
