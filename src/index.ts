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
import {parsePositions} from "./polymarket/bot/parse-positions.js";
import {findFittingPositions} from "./polymarket/bot/find-fitting-positions.js";
import {createOrder} from "./polymarket/bot/create-order.js";
import moment from "moment";

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

    await parsePositions();
    const fittingPositions = await findFittingPositions();

    console.log(fittingPositions);

    const clobClient = await initClient();

    for (const fittingPosition of fittingPositions) {
        try {
            console.log(`Placing order for position: ${fittingPosition.title}`);
            await createOrder(clobClient, fittingPosition);
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (ex: any) {
            console.error(ex);
        }
    }

    console.log(moment().isAfter("2026-01-16T23:59:59"))

    process.exit(0);
})();