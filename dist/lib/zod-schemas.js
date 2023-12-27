"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryValidatorSchema = exports.AuthCredentialsSchema = void 0;
var zod_1 = require("zod");
exports.AuthCredentialsSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, { message: 'No empty fields' }).email(),
    password: zod_1.z.string().min(8, { message: 'Password must be at least 8 characters long.' })
});
exports.QueryValidatorSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional(),
    limit: zod_1.z.number().optional()
});
