import DbClient from "../../src/common/db.js";
import {expect} from "chai";
import {afterAll, afterEach, beforeAll, beforeEach, describe, it} from "vitest";

const currentEnv = process.env.NODE_ENV;
process.env.DB_NAME = "TestDb";
const dbClient = new DbClient();

describe("DB Connection", () => {
    beforeAll(async () => {

    });
    beforeEach(async () => {
        process.env.DB_NAME = "TestDb";
        process.env.NODE_ENV = currentEnv;
    });
    afterEach(async () => {
        await dbClient.getCollection("testCollection").deleteMany({});
    });
    afterAll(async () => {
        await dbClient.dropDatabase();
        await dbClient.close();
    });

    it(`DB connection`, async () => {
        dbClient.getCollection("testCollection");
        const isConnected = await dbClient.checkConnection();

        expect(isConnected).to.equal(true);
    });

    it(`Overrides DB name`, async () => {
        await dbClient.getCollection("testCollection").insertOne({
            test_prop: "override_test_value"
        });

        const secondClient = new DbClient("overrideDbName");
        const overriddenNameClientCount = await secondClient.getCollection("testCollection").countDocuments({test_prop: "override_test_value"});
        const mainClientCount = await dbClient.getCollection("testCollection").countDocuments({test_prop: "override_test_value"});
        await secondClient.dropDatabase();
        await secondClient.close();

        expect(overriddenNameClientCount).to.equal(0);
        expect(mainClientCount).to.equal(1);
    });

    it(`Fails to create client without DB name`, async () => {
        process.env.DB_NAME = "";

        try {
            new DbClient();
        } catch (ex: any) {
            expect(ex.message).to.equal("DB name is not set");
        }
    });

    it(`drops collection`, async () => {
        await dbClient.getCollection("testCollection").insertOne({
           prop: "test_drop_val"
        });
        
        await dbClient.dropCollection("testCollection");
        const count = await dbClient.getCollection("testCollection").countDocuments({test_prop: "test_drop_val"});
        
        expect(count).to.equal(0);
    });

    it(`drops database`, async () => {
        const secondClient = new DbClient("secondDbName");
        await secondClient.getCollection("testCollection").insertOne({
            prop: "test_drop_val"
        });

        await secondClient.dropDatabase();
        const count = await secondClient.getCollection("testCollection").countDocuments({test_prop: "test_drop_val"});
        await secondClient.close();

        expect(count).to.equal(0);
    });

    it(`fails to drop collection and DB in production`, async () => {
        process.env.NODE_ENV = "production";

        await dbClient.getCollection("testCollection").insertOne({
            test_prop: "test_drop_fail_val"
        });

        const secondClient = new DbClient();

        await secondClient.dropCollection("testCollection");
        const collectionDropCount = await dbClient.getCollection("testCollection").countDocuments({test_prop: "test_drop_fail_val"});

        await secondClient.dropDatabase();
        const dbDropCount = await secondClient.getCollection("testCollection").countDocuments({test_prop: "test_drop_fail_val"});

        expect(collectionDropCount).to.equal(1);
        expect(dbDropCount).to.equal(1);

        await secondClient.close();
        process.env.NODE_ENV = currentEnv;
    });

    it(`updates data with findOneAndUpdate static method`, async () => {
        await dbClient.getCollection("testCollection").insertOne({
            test_prop: "test_findOneAndUpdate_init_val"
        });

        await DbClient.findOneAndUpdate("testCollection", {
            test_prop: "test_findOneAndUpdate_init_val"
        }, {
            $set: {
                test_prop: "test_findOneAndUpdate_updated_val"
            }
        });

        const updatedCount = await dbClient.getCollection("testCollection").countDocuments({
            test_prop: "test_findOneAndUpdate_updated_val"
        });

        expect(updatedCount).to.equal(1);
    });

    it(`gets data with findAsArray static method`, async () => {
        await dbClient.getCollection("testCollection").insertOne({
            test_prop: "test_findAsArray"
        });

        const items = await DbClient.findAsArray("testCollection", {});

        expect(items[0]!.test_prop).to.equal("test_findAsArray");
    });

    it(`fails ping with wrong credentials`, async () => {
        process.env.DB_USER = "fail1";
        process.env.DB_PASSWORD = "fail1";

        const client = new DbClient();

        const ping = await client.checkConnection();

        expect(ping).to.equal(false);
    });
});