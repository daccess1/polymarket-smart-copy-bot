import type {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";

/**
 * Интерфейс модели данных запроса
 */
interface DeleteRequestBody {
    body_prop: string;
}

/**
 * Плагин для Fastify, обрабатывающий  DELETE-запрос к эндпоинту REQUEST_URL
 *
 * @param fastify
 */
const plugin: FastifyPluginAsync = async (fastify:FastifyInstance): Promise<void> => {
    fastify.delete("/REQUEST_ENDPOINT", {
        schema: {
            description: "SAMPLE_TYPE REQUEST_ENDPOINT DELETE request",
            tags: ["SAMPLE_TAG"],
            summary: "SAMPLE_TYPE delete",
            security: [{ apiKey: [] }],
            body: {
                type: "object",
                required: ["body_prop"],
                properties: {
                    body_prop: { type: "string" },
                },
                additionalProperties: false
            },
            response: {
                200: {
                    description: "SAMPLE_TYPE REQUEST_ENDPOINT delete success",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: true }
                    }
                },
                400: {
                    description: "SAMPLE_TYPE REQUEST_ENDPOINT request error",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Bad Request" },
                        message: { type: "string" },
                    }
                },
                401: {
                    description: "trip request error",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Unauthorized" },
                        message: { type: "string" },
                    }
                },
                404: {
                    description: "SAMPLE_TYPE not found",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: false },
                        error: { type: "string", default: "Not Found" },
                        message: { type: "string" },
                    }
                },
                500: {
                    description: "SAMPLE_TYPE REQUEST_ENDPOINT delete request failed",
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
                await request.hasPermission!('PLUGIN_PARENT:delete');
            } catch (error: any) {
                return reply.status(401).send({
                    message: error.message,
                });
            }
            /* v8 ignore stop */
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as DeleteRequestBody;

            return reply.status(200).send({
                success: true
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