export interface UserPermission {
    user?: PermissionItem;
}

export interface PermissionItem {
    read?: boolean;
    write?: boolean;
    delete?: boolean;
}

export const PermissionItemSchema = {
    type: "object",
    properties: {
        read: { type: "boolean" },
        write: { type: "boolean" },
        delete: { type: "boolean" }
    }
}

export const UserPermissionSchema = {
    type: "object",
    properties: {
        user: PermissionItemSchema,
    },
    additionalProperties: false,
}