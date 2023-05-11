"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUserForClient = void 0;
const filterUserForClient = (user) => {
    return {
        id: user === null || user === void 0 ? void 0 : user.id,
        username: user === null || user === void 0 ? void 0 : user.username,
        profileImageUrl: user === null || user === void 0 ? void 0 : user.profileImageUrl,
    };
};
exports.filterUserForClient = filterUserForClient;
