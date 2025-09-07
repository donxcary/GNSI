"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareValues = exports.hashValue = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashValue = async (value, saltRounds = 10) => {
    return bcrypt_1.default.hash(value, saltRounds);
};
exports.hashValue = hashValue;
const compareValues = async (value, hashedValue) => {
    return bcrypt_1.default.compare(value, hashedValue);
};
exports.compareValues = compareValues;
