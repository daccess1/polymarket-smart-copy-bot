import {NotFittingPositionForAccount1} from "../test-data/not-fitting-position-for-account1.js";

process.env.DB_NAME = "TestDb-FindFittingPositions";

import {COLLECTION_NAME_SOURCE_ACCOUNT} from "../../src/types/polymarket/account/source-account.js";
import {afterAll, afterEach, beforeAll, beforeEach, describe, it} from "vitest";
import {expect} from "chai";
import DbClient from "../../src/common/db.js";
import {sourceAccount1} from "../test-data/source-account-1.js";
import {sourceAccount2} from "../test-data/source-account-2.js";
import {COLLECTION_NAME_PARSED_POSITION} from "../../src/types/polymarket/positions/parsed-position.js";
import {FittingPositionForAccount1} from "../test-data/fitting-position-for-account1.js";
import {findFittingPositions} from "../../src/polymarket/bot/find-fitting-positions.js";
import {FittingPositionForAccount2} from "../test-data/fitting-position-for-account2.js";
import {PurchasedPositionForAccount1} from "../test-data/purchased-position-for-account1.js";

const dbClient = new DbClient(process.env.DB_NAME);

describe("Find fitting positions", () => {
    beforeAll(async () => {
    });
    beforeEach(async () => {
        await dbClient.getCollection(COLLECTION_NAME_SOURCE_ACCOUNT).insertOne(sourceAccount1);
        await dbClient.getCollection(COLLECTION_NAME_SOURCE_ACCOUNT).insertOne(sourceAccount2);
    });
    afterEach(async () => {
        await dbClient.getCollection(COLLECTION_NAME_SOURCE_ACCOUNT).deleteMany({});
        dbClient.getCollection(COLLECTION_NAME_PARSED_POSITION).deleteMany({});
    });
    afterAll(async () => {
        await dbClient.dropDatabase();
        await dbClient.close();
    });

    it(`Should find fitting position`, async () => {
        await dbClient.getCollection(COLLECTION_NAME_PARSED_POSITION).insertOne(FittingPositionForAccount1);

        const fittingPositions = await findFittingPositions();

        expect(fittingPositions.length).to.equal(1);
        expect(fittingPositions[0]!.slug).to.equal(FittingPositionForAccount1.slug);
    });

    it(`Should skip not fitting position`, async () => {
        await dbClient.getCollection(COLLECTION_NAME_PARSED_POSITION).insertOne(NotFittingPositionForAccount1);

        const fittingPositions = await findFittingPositions();

        expect(fittingPositions.length).to.equal(0);
    });

    it(`Should skip purchased position`, async () => {
        await dbClient.getCollection(COLLECTION_NAME_PARSED_POSITION).insertOne(PurchasedPositionForAccount1);

        const fittingPositions = await findFittingPositions();

        console.log(fittingPositions);

        expect(fittingPositions.length).to.equal(0);
    });

    it(`Should skip duplicate fitting position`, async () => {
        await dbClient.getCollection(COLLECTION_NAME_PARSED_POSITION).insertOne(FittingPositionForAccount1);
        await dbClient.getCollection(COLLECTION_NAME_PARSED_POSITION).insertOne(FittingPositionForAccount2);

        const fittingPositions = await findFittingPositions();

        expect(fittingPositions.length).to.equal(1);
        expect(fittingPositions[0]!.slug).to.equal(FittingPositionForAccount1.slug);
    });
});