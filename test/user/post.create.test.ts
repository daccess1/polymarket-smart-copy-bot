import {COLLECTION_NAME_USER, type User} from "../../src/types/user/user.js";

process.env.DB_NAME = "user-create-TestDb";

import Fastify, {type FastifyInstance} from "fastify";
import {expect} from "chai";
import {describe, it, beforeEach, afterEach, beforeAll, afterAll} from "vitest";
import DbClient from "../../src/common/db.js";
import plugin from "../../src/plugins/user/post.create.js";
import type {UserPermission} from "../../src/types/user/permission.js";
import {createHash} from "node:crypto";

const dbClient = new DbClient(process.env.DB_NAME);
const fastify: FastifyInstance = Fastify();

describe.sequential("user create tests", () => {
    const payload = {
        username: "create-username",
        display_name: "create display_name",
        password: "create-password",
        permissions: {
            user: {
                read: true,
                write: true,
                delete: true,
            }
        }
    }

    beforeEach(async () => {
    });
    afterEach(async () => {
        await dbClient.getCollection(COLLECTION_NAME_USER).deleteMany({});
    });
    beforeAll(async () => {
        fastify.decorateRequest("hasPermission", async (permission: string) => {
            return true;
        });
        fastify.register(plugin, {
            prefix: 'user'
        });
        fastify.ready();
    });
    afterAll(async () => {
        await fastify.close();
        await dbClient.dropDatabase();
        await dbClient.close();
    });

    it("should successfully POST create", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/user/create",
            body: payload
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(200);
        expect(body.success).to.equal(true);
        expect(body.id.length).to.be.greaterThan(0);

        const model = await dbClient.getCollection<User>(COLLECTION_NAME_USER).findOne({
            username: payload.username,
        });
        const password_hash = createHash('md5').update(payload.password).digest('hex');

        expect(model).not.to.be.null;
        expect(model?.username).to.equal(payload.username);
        expect(model?.display_name).to.equal(payload.display_name);
        expect(model?.permissions).to.deep.equal(payload.permissions);
        expect(model?.password_hash).to.equal(password_hash);

        expect(body.id).to.equal(model?._id.toString());
    });

    it("should fail POST create for existing username", async () => {
        await dbClient.getCollection(COLLECTION_NAME_USER).insertOne({
            username: payload.username,
            display_name: "create username",
            password_hash: "",
            permissions: {

            }
        });
        const response = await fastify.inject({
            method: "POST",
            url: "/user/create",
            body: payload
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(400);
        expect(body.success).to.equal(false);
        expect(body.message).to.equal("User already exists");
    });

    it("should fail POST create with incorrect body params", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/user/create",
            body: {
                wrong: "wrong val"
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(400);
        expect(body.success).to.equal(false);
    });
});