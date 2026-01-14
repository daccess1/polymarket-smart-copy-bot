import type {UserPermission} from "./permission.js";
import type {WithId} from "../../common/db.js";

export const COLLECTION_NAME_USER = "user";

export interface User extends WithId<any> {
    username: string;
    display_name: string;
    password_hash: string;
    permissions: UserPermission;
    created_at: Date;
}