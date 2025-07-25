"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidator = exports.zodError = void 0;
const admin_validator_1 = __importDefault(require("./admin.validator"));
exports.AdminValidator = admin_validator_1.default;
const zodError = (error) => {
    let errors = {};
    error.issues.map((issue) => {
        var _a;
        const path = (_a = issue.path) === null || _a === void 0 ? void 0 : _a[0];
        if (path)
            errors[path] = issue.message;
    });
    return errors;
};
exports.zodError = zodError;
