import type {FastifyInstance, FastifyRequest} from "fastify";
import path from "path";
import {fileURLToPath} from "node:url";
import {fastifyJwt} from "@fastify/jwt";
import fs from "node:fs";
import type {JwtData} from "./types/user/jwt-data.js";
import {getDbClient} from "./common/db.js";
import {COLLECTION_NAME_USER, type User} from "./types/user/user.js";

export async function enableAuth(fastify: FastifyInstance): Promise<void> {
    let privateKey = path.resolve(fileURLToPath(import.meta.url), '../../private.pem');
    let publicKey = path.resolve(fileURLToPath(import.meta.url), '../../public.pem');

    if (process.env.NODE_ENV == 'production') {
        privateKey = '/mnt/keys/private.pem';
        publicKey = '/mnt/keys/public.pem';
    }

    fastify.register(fastifyJwt, {
        secret: {
            private: fs.readFileSync(privateKey),
            public: fs.readFileSync(publicKey)
        },
        sign: {
            algorithm: 'RS256',
        },
        verify: {
            extractToken: (request: FastifyRequest): string => {
                return request.headers['x-auth-token'] as string;
            },
        }
    });

    fastify.decorateRequest('hasPermission', async () => {
        throw new Error('hasPermission not initialized');
    });

    fastify.addHook("onRequest", async (request, reply) => {
        if (request.url === '/user/login') {
            return;
        }

        try {
            await request.jwtVerify();
            const jwtPayload = await request.jwtDecode<JwtData>();

            request.hasPermission = async (permissionPath: string) => {
                const user = await getDbClient().getCollection<User>(COLLECTION_NAME_USER).findOne({
                    username: jwtPayload.username
                });

                if (!user) {
                    throw new Error('Unauthorized');
                }

                const parts = permissionPath.split(':'); // e.g., 'hangar:read'
                let current: any = user.permissions;

                for (const part of parts) {
                    if (current[part] === undefined || current === false) {
                        throw new Error('Unauthorized');
                    }
                    current = current[part];
                }

                if (!current) {
                    throw new Error('Unauthorized');
                }

                return true;
            }
        } catch (err) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized'
            });
        }
    });
}