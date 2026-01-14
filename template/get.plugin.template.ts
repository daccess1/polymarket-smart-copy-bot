import type {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";

interface GetRequestSchema {
    query_prop: string;
    array_prop?: string[];
}

const plugin: FastifyPluginAsync = async (fastify:FastifyInstance): Promise<void> => {
    fastify.get("/REQUEST_ENDPOINT", {
        schema: {
            description: "SAMPLE_TYPE GET request",
            tags: ["SAMPLE_TAG"],
            summary: "Get SAMPLE_TYPE",
            security: [{ apiKey: [] }],
            querystring: {
                type: "object",
                properties: {
                    query_prop: { type: "string" },
                    array_prop: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                },
                required: ["query_prop"],
                additionalProperties: false
            },
            response: {
                200: {
                    description: "SAMPLE_TYPE successfully loaded",
                    type: "object",
                    properties: {
                        success: { type: "boolean", default: true },
                    }
                },
                400: {
                    description: "SAMPLE_TYPE request error",
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
                    description: "SAMPLE_TYPE load failed",
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
                await request.hasPermission!('PLUGIN_PARENT:read');
            } catch (error: any) {
                return reply.status(401).send({
                    message: error.message,
                });
            }
            /* v8 ignore stop */
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const query = request.query as GetRequestSchema;

            return reply.status(200).send({
                success: true,
                items: [
                    { response_prop: query.query_prop },
                ]
            });
        /* v8 ignore start */
        } catch (ex: any) {
            return reply.status(500).send({
                success: false,
                error: "Exception",
                message: ex.message
            });
        }
        /* v8 ignore stop */
    });
}

export default plugin;