import type {UserPermission} from "./permission.js";

export interface JwtData {
    id: string;
    username: string;
    permissions: UserPermission;
    expires_at: Date;
}