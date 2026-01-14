import 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        hasPermission?: (permission: string) => Promise<boolean>;
    }
}