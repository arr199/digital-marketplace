"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
var API_1 = __importDefault(require("../../lib/API"));
var stripe_1 = require("../../lib/stripe");
var addUser = function (_a) {
    var req = _a.req, data = _a.data;
    var user = req.user;
    return __assign(__assign({}, data), { user: user.id });
};
exports.Products = {
    slug: 'products',
    admin: {
        useAsTitle: 'name'
    },
    access: {},
    hooks: {
        beforeChange: [
            addUser,
            // CREATING THE PRODUCT IN STRIPE AND SAVING THE STRIPE ID AND PRICE ID IN OUR PRODUCT COLLECTION
            function (args) { return __awaiter(void 0, void 0, void 0, function () {
                var data, createProduct, updatedProduct, data, updateProduct, updatedProduct;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(args.operation === 'create')) return [3 /*break*/, 2];
                            data = args.data;
                            return [4 /*yield*/, stripe_1.stripe.products.create({
                                    name: data.name,
                                    default_price_data: {
                                        currency: 'USD',
                                        unit_amount: Math.round(data.price * 100) // the price of the product must be in cents
                                    }
                                })];
                        case 1:
                            createProduct = _b.sent();
                            updatedProduct = __assign(__assign({}, data), { stripeId: createProduct.id, priceId: createProduct.default_price // the string price id from stripe
                             });
                            return [2 /*return*/, updatedProduct];
                        case 2:
                            if (!(args.operation === 'update')) return [3 /*break*/, 4];
                            data = args.data;
                            return [4 /*yield*/, stripe_1.stripe.products.update((_a = data.stripeId) !== null && _a !== void 0 ? _a : '', {
                                    default_price: data.priceId
                                })];
                        case 3:
                            updateProduct = _b.sent();
                            updatedProduct = __assign(__assign({}, data), { stripeId: updateProduct.id, priceId: updateProduct.default_price });
                            return [2 /*return*/, updatedProduct];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }
        ]
    },
    fields: [
        // USER
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            hasMany: false,
            admin: {
                condition: function () { return false; }
            }
        },
        // NAME
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true
        },
        //  DESCRIPTION
        {
            name: 'description',
            type: 'textarea',
            label: 'Product details'
        },
        // PRICE
        {
            name: 'price',
            type: 'number',
            min: 0,
            max: 1000,
            required: true
        },
        // CATEGORY
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: API_1.default.PRODUCT_CATEGORIES.map(function (_a) {
                var label = _a.label, value = _a.value;
                return ({ label: label, value: value });
            }),
            required: true
        },
        //  PRODUCT_FILES
        {
            name: 'product_files',
            label: 'Products file(s)',
            type: 'relationship',
            relationTo: 'product_files',
            required: true,
            hasMany: false
        },
        // PRODUCT STATUS
        {
            access: {
                create: function (_a) {
                    var req = _a.req;
                    return req.user.role === 'admin';
                },
                read: function (_a) {
                    var req = _a.req;
                    return req.user.role === 'admin';
                },
                update: function (_a) {
                    var req = _a.req;
                    return req.user.role === 'admin';
                }
            },
            name: 'approvedForSale',
            label: 'Product Status',
            type: 'select',
            defaultValue: 'pending',
            options: [
                { label: 'Pending verification', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Denied', value: 'denied' }
            ]
        },
        // PRICE ID
        {
            name: 'priceId',
            access: {
                create: function () { return false; },
                update: function () { return false; },
                read: function () { return false; }
            },
            type: 'text',
            admin: {
                hidden: true
            }
        },
        // STRIPE ID
        {
            name: 'stripeId',
            access: {
                create: function () { return false; },
                update: function () { return false; },
                read: function () { return false; }
            },
            type: 'text',
            admin: {
                hidden: true
            }
        },
        //  IMAGES
        {
            name: 'images',
            type: 'array',
            label: 'Product images',
            minRows: 1,
            maxRows: 4,
            labels: {
                singular: 'Image',
                plural: 'Images'
            },
            fields: [
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    required: true
                }
            ]
        }
    ]
};
