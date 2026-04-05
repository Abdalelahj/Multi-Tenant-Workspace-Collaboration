"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentWorkspace = exports.CurrentUser = exports.AuthUser = void 0;
const common_1 = require("@nestjs/common");
class AuthUser {
    id;
    workspaceId;
    name;
    email;
    avatarColor;
}
exports.AuthUser = AuthUser;
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
exports.CurrentWorkspace = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspaceId;
});
//# sourceMappingURL=auth.decorators.js.map