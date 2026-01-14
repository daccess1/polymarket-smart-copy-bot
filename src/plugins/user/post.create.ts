import {type UserPermission, UserPermissionSchema} from "../../types/user/permission.js";
import type {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";
import {createHash} from "node:crypto";
import {COLLECTION_NAME_USER, type User} from "../../types/user/user.js";
import {ObjectId} from "mongodb";
import {getDbClient} from "../../common/db.js";

/**
 * Интерфейс модели данных запроса
 */
interface PostRequestBody {
    username: string;
    display_name: string;
    password: string;
    permissions: UserPermission;
}

/**
 * Плагин для Fastify, обрабатывающий  POST-запрос к эндпоинту user/create
 *
 * @param fastify
 */
const plugin: FastifyPluginAsync = async (fastify:FastifyInstance): Promise<void> => {
    fastify.post("/create", {
        schema: {
            description: "user create POST request",
            tags: ["user"],
            summary: "user update",
            security: [{ apiKey: [] }],
            body: {
                type: "object",
                required: ["username"],
                properties: {
                    username: { type: "string" },
                    display_name: { type: "string" },
                    password: { type: "string" },
                    permissions: UserPermissionSchema
                },
                additionalProperties: false
            },
            response: {
                200: {
                    description: "user create success",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: true },
                        id: { type: "string" }
                    }
                },
                400: {
                    description: "user create request error",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Bad Request" },
                        message: { type: "string" },
                    }
                },
                401: {
                    description: "request error",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Unauthorized" },
                        message: { type: "string" },
                    }
                },
                404: {
                    description: "user not found",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Not Found" },
                        message: { type: "string" },
                    }
                },
                500: {
                    description: "user create request failed",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string" },
                        message: { type: "string" },
                    }
                }
            }
        },
        preHandler: async (request, reply) => {
            /* v8 ignore start */
            try {
                await request.hasPermission!('user:write');
            } catch (error: any) {
                return reply.status(401).send({
                    message: error.message,
                });
            }
            /* v8 ignore stop */
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as PostRequestBody;

        try {
            const password_hash = createHash('md5').update(body.password).digest('hex');

            const existingUser = await getDbClient().getCollection(COLLECTION_NAME_USER).countDocuments({
                username: body.username,
            });

            if (existingUser) {
                return reply.status(400).send({
                    message: "User already exists",
                });
            }

            const id = new ObjectId();

            const user = await getDbClient().getCollection<User>(COLLECTION_NAME_USER).insertOne({
                _id: id,
                username: body.username,
                display_name: body.display_name,
                password_hash: password_hash,
                permissions: body.permissions,
                created_at: new Date()
            });

            return reply.status(200).send({
                success: true,
                id: id.toString()
            });
        /* v8 ignore start */
        } catch (ex: any) {
            return  reply.status(500).send({
                success: false,
                error: "Exception",
                message: ex.message
            });
        }
        /* v8 ignore stop */
    });
}

export default plugin;