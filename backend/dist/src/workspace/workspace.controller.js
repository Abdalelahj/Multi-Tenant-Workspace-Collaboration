"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const workspace_guard_1 = require("../auth/workspace.guard");
const auth_decorators_1 = require("../auth/auth.decorators");
const auth_decorators_2 = require("../auth/auth.decorators");
const workspace_service_1 = require("./workspace.service");
let WorkspaceController = class WorkspaceController {
    workspaceService;
    constructor(workspaceService) {
        this.workspaceService = workspaceService;
    }
    async getWorkspaceBySlug(slug) {
        return this.workspaceService.findBySlug(slug);
    }
    async getWorkspace(workspaceId, user) {
        return this.workspaceService.findById(workspaceId, user.workspaceId);
    }
    async getMembers(workspaceId, user) {
        return this.workspaceService.getMembers(workspaceId, user.workspaceId);
    }
};
exports.WorkspaceController = WorkspaceController;
__decorate([
    (0, common_1.Get)('slug/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "getWorkspaceBySlug", null);
__decorate([
    (0, common_1.Get)(':workspaceId'),
    (0, common_1.UseGuards)(workspace_guard_1.WorkspaceGuard),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_decorators_2.AuthUser]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "getWorkspace", null);
__decorate([
    (0, common_1.Get)(':workspaceId/members'),
    (0, common_1.UseGuards)(workspace_guard_1.WorkspaceGuard),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_decorators_2.AuthUser]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "getMembers", null);
exports.WorkspaceController = WorkspaceController = __decorate([
    (0, common_1.Controller)('workspaces'),
    __metadata("design:paramtypes", [workspace_service_1.WorkspaceService])
], WorkspaceController);
//# sourceMappingURL=workspace.controller.js.map