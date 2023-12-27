"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var db_mongodb_1 = require("@payloadcms/db-mongodb");
var richtext_slate_1 = require("@payloadcms/richtext-slate");
var config_1 = require("payload/config");
var bundler_webpack_1 = require("@payloadcms/bundler-webpack");
var path_1 = __importDefault(require("path"));
var users_1 = require("../collections/users");
var products_1 = require("../collections/products/products");
var media_1 = require("../collections/media");
var productFile_1 = require("../collections/productFile");
var orders_1 = require("../collections/orders");
exports.default = (0, config_1.buildConfig)({
    serverURL: (_a = process.env.NEXT_PUBLIC_SERVER_URL) !== null && _a !== void 0 ? _a : '',
    collections: [users_1.Users, products_1.Products, media_1.Media, productFile_1.ProductFiles, orders_1.Orders],
    routes: {
        admin: '/sell'
    },
    admin: {
        bundler: (0, bundler_webpack_1.webpackBundler)(),
        user: 'users',
        meta: {
            titleSuffix: '- DigitalHippo',
            favicon: '/favicon.ico',
            ogImage: '/thumbnail.jpg'
        }
    },
    rateLimit: { max: 2000 },
    editor: (0, richtext_slate_1.slateEditor)({}),
    db: (0, db_mongodb_1.mongooseAdapter)({ url: (_b = process.env.MONGODB_URL) !== null && _b !== void 0 ? _b : '' }),
    typescript: {
        outputFile: path_1.default.resolve(__dirname, 'payload-types.ts')
    }
});
