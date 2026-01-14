process.env.DB_NAME = "SAMPLE_TYPE-REQUEST_ENDPOINT-TestDb";

import Fastify, {type FastifyInstance} from "fastify";
import {expect} from "chai";
import {describe, it, beforeEach, afterEach, beforeAll, afterAll} from "vitest";
import DbClient from "../src/common/db.js";
import plugin from "../src/plugins/PLUGIN_PATH/post.REQUEST_ENDPOINT.js";

const dbClient = new DbClient(process.env.DB_NAME);
const fastify: FastifyInstance = Fastify();

describe.sequential("SAMPLE_TYPE REQUEST_ENDPOINT tests", () => {
    beforeEach(async () => {
        await dbClient.getCollection(SET_COLLECTION_NAME).insertOne();
    });
    afterEach(async () => {
        await dbClient.getCollection(SET_COLLECTION_NAME).deleteMany({});
    });
    beforeAll(async () => {
        fastify.decorateRequest("hasPermission", async (permission: string) => {
            return true;
        });
        fastify.register(plugin, {
            prefix: 'PLUGIN_PATH'
        });
        fastify.ready();
    });
    afterAll(async () => {
        await fastify.close();
        await dbClient.dropDatabase();
        await dbClient.close();
    });

    it("should successfully POST REQUEST_ENDPOINT", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/REQUEST_URL",
            body: {
                body_prop: "body_val"
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(200);
        expect(body.success).to.equal(true);
    });

    it("should fail POST REQUEST_ENDPOINT with incorrect body params", async () => {
        const response = await fastify.inject({
            method: "POST",
            url: "/REQUEST_URL",
            body: {
                wrong: "wrong val"
            }
        });

        const body = JSON.parse(response.payload);

        expect(response.statusCode).to.equal(400);
        expect(body.success).to.equal(false);
    });
});