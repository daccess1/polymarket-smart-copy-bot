import {fileURLToPath} from "node:url";
import path from "path";
import type {FastifyInstance} from "fastify";
import Fastify from "fastify";
import {fastifyCors} from "@fastify/cors";
import {fastifyAutoload} from '@fastify/autoload';
import {enableAuth} from "./enable-auth.js";
import {initClient} from "./polymarket/client/init-client.js";
import type {Market} from "./types/polymarket/market.js";
import {OrderType, Side} from "@polymarket/clob-client";
import {fetchAccountPositions} from "./polymarket/positions/fetch-account-positions.js";

(async () => {
    // const fastify: FastifyInstance = await Fastify({
    //     logger: true
    // });
    //
    // await fastify.register(fastifyCors, {
    //     methods: ["GET", "POST", "DELETE"],
    // });
    //
    // await fastify.register(fastifyAutoload, {
    //     dir: path.resolve(fileURLToPath(import.meta.url), '../plugins'),
    // });
    //
    // await enableAuth(fastify);
    //
    // await fastify.ready();
    //
    // try {
    //     await fastify.listen({
    //         host: "0.0.0.0",
    //         port: parseInt(process.env.PORT as string)
    //     });
    // } catch (err: any) {
    //     fastify.log.error(err);
    //     process.exit(1);
    // }

    // const CONDITION_ID = "0x98c9177a4d5253562dc25787f7fecb4e1f82bf620111ecdf393d07b6c300753d";
    // const OUTCOME = "Under";
    //
    // const client = await initClient();
    //
    // // const keys = await client.getApiKeys();
    // // console.log("Keys:", keys.apiKeys);
    // //
    // // const trades = await client.getTrades();
    // //
    // // console.log("Trades:", trades);
    //
    // // Get market info first
    // const market = await client.getMarket(CONDITION_ID) as Market;
    //
    // // console.log(market);
    //
    // const tokens = market.tokens;
    //
    // const buyToken = tokens.filter(token => token.outcome === OUTCOME)[0];
    //
    // if (!buyToken) {
    //     throw new Error(`Token ${OUTCOME} not found`);
    // } else {
    //     console.log("Buy token:", buyToken.token_id, "(", buyToken.price, ")");
    // }
    //
    // const response = await client.createAndPostOrder(
    //     {
    //         tokenID: buyToken.token_id,
    //         price: buyToken.price,        // Price per share ($0.50)
    //         size: market.minimum_order_size,           // Number of shares
    //         side: Side.BUY,     // BUY or SELL
    //     },
    //     {
    //         tickSize: market.minimum_tick_size,
    //         negRisk: market.neg_risk,    // true for multi-outcome events
    //     },
    //     OrderType.GTC  // Good-Til-Cancelled
    // );
    //
    // console.log("Order ID:", response.orderID);
    // console.log("Status:", response.status);

    const positions = await fetchAccountPositions('0x2005d16a84ceefa912d4e380cd32e7ff827875ea');
})();