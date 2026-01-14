process.env.DB_NAME = "user-login-TestDb";

import DbClient from "../../src/common/db.js";
import Fastify, {type FastifyInstance} from "fastify";
import {expect} from "chai";
import {COLLECTION_NAME_USER, type User} from "../../src/types/user/user.js";
import {createHash} from "node:crypto";
import {enableAuth} from "../../src/enable-auth.js";
import {describe, it, beforeEach, afterEach, beforeAll, afterAll} from "vitest";
import postLogin from "../../src/plugins/user/post.login.js";

const dbClient = new DbClient();
const fastify: FastifyInstance = Fastify();

describe("user login tests", () => {
    const password = "pass";
    const user: User = {
        username: "user",
        display_name: "Test User",
        password_hash: createHash("md5").update(password).digest("hex"),
        permissions: {
            user: {
                read: true,
                write: true,
                delete: true
            }
        },
        created_at: new Date(),
    }

    beforeEach(async () => {
        await dbClient.getCollection(COLLECTION_NAME_USER).insertOne(user);
    });
    afterEach(async () => {
        await dbClient.getCollection(COLLECTION_NAME_USER).deleteMany({});
    });
    beforeAll(async () => {
        await enableAuth(fastify);
        fastify.register(postLogin, {
            prefix: 'user'
        });
        fastify.ready();
    });
    afterAll(async () => {
        await fastify.close();
        await dbClient.dropDatabase();
        await dbClient.close();
    });

    it("should successfully POST login", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/user/login",
            body: {
                username: user.username,
                password: password,
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(200);
        expect(body.success).to.equal(true);
        expect(body.token.length).to.be.greaterThan(0);
    });

    it("should fail POST login with wrong username", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/user/login",
            body: {
                username: "wrong val",
                password: password
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(401);
        expect(body.success).to.equal(false);
    });

    it("should fail POST login with wrong password", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/user/login",
            body: {
                username: user.username,
                password: "wrong password"
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(401);
        expect(body.success).to.equal(false);
    });

    it("should fail POST login with incorrect body params", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/user/login",
            body: {
                wrong: "wrong val"
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(400);
        expect(body.success).to.equal(false);
    });
});