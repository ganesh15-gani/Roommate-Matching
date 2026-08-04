"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectionController_1 = require("../controllers/connectionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/request', authMiddleware_1.protect, connectionController_1.sendRequest);
router.post('/respond', authMiddleware_1.protect, connectionController_1.respondRequest);
router.post('/cancel', authMiddleware_1.protect, connectionController_1.cancelRequest);
router.get('/requests', authMiddleware_1.protect, connectionController_1.getRequests);
router.get('/', authMiddleware_1.protect, connectionController_1.getConnections);
exports.default = router;
