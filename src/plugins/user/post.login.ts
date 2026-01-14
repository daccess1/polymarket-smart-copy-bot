import {createHash} from "node:crypto";
import moment from "moment";
import type {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";
import {UserPermissionSchema} from "../../types/user/permission.js";
import {COLLECTION_NAME_USER, type User} from "../../types/user/user.js";
import {getDbClient} from "../../common/db.js";

/**
 * Интерфейс модели данных запроса
 */
interface PostRequestBody {
    username: string;
    password: string;
}

/**
 * Плагин для Fastify, обрабатывающий  POST-запрос к эндпоинту user/login
 *
 * @param fastify
 */
const plugin: FastifyPluginAsync = async (fastify:FastifyInstance): Promise<void> => {
    fastify.post("/login", {
        schema: {
            description: "user login POST request",
            tags: ["SAMPLE_TAG"],
            summary: "user update",
            security: [{ apiKey: [] }],
            body: {
                type: "object",
                required: ["username", "password"],
                properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                },
                additionalProperties: false
            },
            response: {
                200: {
                    description: "user login success",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: true },
                        token: { type: "string" },
                        permissions: UserPermissionSchema,
                    }
                },
                400: {
                    description: "user login request error",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Bad Request" },
                        message: { type: "string" },
                    }
                },
                401: {
                    description: "Unauthorized",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Not Found" },
                        message: { type: "string" },
                    }
                },
                500: {
                    description: "user login request failed",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string" },
                        message: { type: "string" },
                    }
                }
            }
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as PostRequestBody;

        try {
            const user = await getDbClient().getCollection<User>(COLLECTION_NAME_USER).findOne({
                username: body.username,
            });

            if (!user) {
                return reply.status(401).send({
                    message: "Unauthorized",
                });
            }

            const hash = createHash("md5").update(body.password).digest("hex");

            if (hash !== user.password_hash) {
                return reply.status(401).send({
                    message: "Unauthorized",
                });
            }

            const token = fastify.jwt.sign({
                id: user._id,
                username: body.username,
                permissions: user.permissions,
                expires_at: moment().add(1, 'month').toISOString()
            });

            return reply.status(200).send({
                success: true,
                token: token,
                permissions: user.permissions
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