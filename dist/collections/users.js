"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
exports.Users = {
    slug: 'users',
    auth: {
        verify: {
            generateEmailHTML: function (_a) {
                var token = _a.token;
                return "\n        <div>\n          <h1>Verify the email</h1>\n          <p>Click the link below in order to proceed.</p>\n          </br>\n          <a href=\"".concat(process.env.NEXT_PUBLIC_SERVER_URL, "/verify-email?token=").concat(token, "\">Verify here!</a>\n         </div>");
            }
        }
    },
    access: {
        read: function () { return true; },
        create: function () { return true; }
    },
    fields: [
        {
            name: 'role',
            defaultValue: 'user',
            required: true,
            admin: {
                condition: function () { return true; }
            },
            type: 'select',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' }
            ]
        }
    ]
};
