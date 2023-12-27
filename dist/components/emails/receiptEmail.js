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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptEmailHtml = void 0;
var react_1 = __importDefault(require("react"));
var utils_1 = require("../../lib/utils");
var format_1 = __importDefault(require("date-fns/format"));
var components_1 = require("@react-email/components");
function ReceiptEmail(_a) {
    var date = _a.date, email = _a.email, orderId = _a.orderId, products = _a.products;
    var totalPrice = products.reduce(function (acc, curr) { return acc + curr.price; }, 0);
    return (react_1.default.createElement("div", { className: 'flex flex-col ' },
        react_1.default.createElement("h1", { className: 'text-2xl' }, "This is the receipt"),
        react_1.default.createElement("p", null, email),
        react_1.default.createElement("p", null,
            "OrderId : ",
            orderId),
        react_1.default.createElement("p", null,
            "Price : ",
            (0, utils_1.formatPrice)(totalPrice)),
        react_1.default.createElement("p", null,
            "Date ",
            (0, format_1.default)(date, 'dd mm yyyy'))));
}
function receiptEmailHtml(props) {
    return (0, components_1.render)(react_1.default.createElement(ReceiptEmail, __assign({}, props)), { pretty: true });
}
exports.receiptEmailHtml = receiptEmailHtml;
