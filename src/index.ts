import {fileURLToPath} from "node:url";
import path from "path";
import type {FastifyInstance} from "fastify";
import Fastify from "fastify";
import {fastifyCors} from "@fastify/cors";
import {fastifyAutoload} from '@fastify/autoload';
import {enableAuth} from "./enable-auth.js";

(async () => {
    const fastify: FastifyInstance = await Fastify({
        logger: true
    });

    await fastify.register(fastifyCors, {
        methods: ["GET", "POST", "DELETE"],
    });

    await fastify.register(fastifyAutoload, {
        dir: path.resolve(fileURLToPath(import.meta.url), '../plugins'),
    });

    await enableAuth(fastify);

    await fastify.ready();

    try {
        await fastify.listen({
            host: "0.0.0.0",
            port: parseInt(process.env.PORT as string)
        });
    } catch (err: any) {
        fastify.log.error(err);
        process.exit(1);
    }
})();