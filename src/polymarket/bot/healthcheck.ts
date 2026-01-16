import axios from "axios";
import chalk from "chalk";
import {initClient} from "../client/init-client.js";
import {getDbClient} from "../../common/db.js";

export async function healthcheck() {
    const dbConnection = await getDbClient().checkConnection();

    if (!dbConnection) {
        throw new Error("Database connection failed.");
    }

    console.log(`MongoDB connection: ${chalk.green('OK')}`);

    const pmDataApi = await axios.get("https://data-api.polymarket.com/");

    if (!pmDataApi.data || pmDataApi.status !== 200) {
        throw new Error("Polymarket data API is not available");
    }

    if (pmDataApi.data.data !== "OK") {
        throw new Error(`Polymarket data API is not OK: ${pmDataApi.data.data}`);
    }

    console.log(`Polymarket data API: ${chalk.green('OK')}`);

    const client = await initClient();

    if (!client) {
        throw new Error("Polymarket client initialization failed.");
    }

    if (!client.creds?.key || !client.creds?.secret || !client.creds.passphrase) {
        throw new Error("Polymarket client credentials are not set.");
    }

    console.log(`Polymarket CLOB client: ${chalk.green('OK')}`);
    console.log('======================================');
    console.log('Bot is healthy, starting');
    console.log('======================================');
}