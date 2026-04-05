export declare class AuthUser {
    id: string;
    workspaceId: string;
    name: string;
    email: string;
    avatarColor: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const CurrentWorkspace: (...dataOrPipes: unknown[]) => ParameterDecorator;
