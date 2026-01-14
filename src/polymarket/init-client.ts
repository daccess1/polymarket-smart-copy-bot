import {Wallet} from "ethers";
import {ClobClient} from "@polymarket/clob-client";

export async function initClient() {
    const HOST = "https://clob.polymarket.com";
    const CHAIN_ID = 137; // Polygon mainnet
    const signer = new Wallet(process.env.PRIVATE_KEY as string);
    const SIGNATURE_TYPE = 2;
    const FUNDER_ADDRESS = process.env.PROXY_WALLET; // For EOA, funder is your wallet

    const credsClient =  new ClobClient(HOST, CHAIN_ID, signer);

    const userApiCreds = await credsClient.deriveApiKey();

    console.log("API Key:", userApiCreds.key);
    console.log("Secret:", userApiCreds.secret);
    console.log("Passphrase:", userApiCreds.passphrase);

    return new ClobClient(
        HOST,
        CHAIN_ID,
        signer,
        userApiCreds,
        SIGNATURE_TYPE,
        FUNDER_ADDRESS
    );
}