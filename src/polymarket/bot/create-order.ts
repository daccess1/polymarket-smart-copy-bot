import {type ClobClient, type OrderResponse, OrderType, Side} from "@polymarket/clob-client";
import {
    COLLECTION_NAME_PARSED_POSITION,
    type ParsedPosition
} from "../../types/polymarket/positions/parsed-position.js";
import type {Market} from "../../types/polymarket/market.js";
import {getDbClient} from "../../common/db.js";

export async function createOrder(client: ClobClient, position: ParsedPosition) {
    // Get market info first
    const market = await client.getMarket(position.conditionId) as Market;

    // console.log(market);

    const tokens = market.tokens;

    const buyToken = tokens.filter(token => token.outcome === position.outcome)[0];

    if (!buyToken) {
        throw new Error(`Token ${position.outcome} not found`);
    } else if (buyToken.price === 0) {
        return;
    } else {
        console.log(`Buy token: ${position.title} - ${buyToken.outcome}, (${buyToken.price})`);
    }

    const maxAmountToSpend = parseFloat(process.env.MAX_AMOUNT_TO_SPEND ?? "0.0");
    const maxPurchaseSharePrice = parseFloat(process.env.MAX_PURCHASE_SHARE_PRICE ?? "0.0");

    if (buyToken.price > maxPurchaseSharePrice) {
        console.log(`Buy token price (${buyToken.price}) is higher than max purchase share price(${maxPurchaseSharePrice})`);
        return;
    }

    let orderSharesAmount = Math.floor(maxAmountToSpend / buyToken.price);

    if (orderSharesAmount < market.minimum_order_size) {
        orderSharesAmount = market.minimum_order_size;
    }

    const buyOrder = await client.createAndPostOrder(
        {
            tokenID: buyToken.token_id,
            price: buyToken.price,
            size: orderSharesAmount,
            side: Side.BUY,
        },
        {
            tickSize: market.minimum_tick_size,
            negRisk: market.neg_risk,    // true for multi-outcome events
        },
        OrderType.GTC
    ) as OrderResponse;

    // const sellOrder = await client.createOrder(
    //     {
    //         tokenID: buyToken.token_id,
    //         price: 0.99,
    //         size: orderSharesAmount,
    //         side: Side.SELL,
    //     },
    //     {
    //         tickSize: market.minimum_tick_size,
    //         negRisk: market.neg_risk,
    //     },
    // );

    // const postOrderResponse = await client.postOrders([{
    //     order: buyOrder,
    //     ,
    // // }, {
    // //     order: sellOrder,
    // //     orderType: OrderType.GTC
    // // }]);

    console.log(buyOrder);

    if (buyOrder.success) {
        await getDbClient().getCollection(COLLECTION_NAME_PARSED_POSITION).updateOne({
            sourceAccount: position.sourceAccount,
            conditionId: position.conditionId,
            outcome: position.outcome,
        }, {
            $set: {
                purchased: true,
            }
        });
    }
}