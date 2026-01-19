import {type ClobClient, type OrderResponse, OrderType, Side} from "@polymarket/clob-client";
import {type ParsedPosition} from "../../types/polymarket/positions/parsed-position.js";
import type {Market} from "../../types/polymarket/market.js";
import {getDbClient} from "../../common/db.js";
import {
    COLLECTION_NAME_PURCHASED_POSITION,
    type PurchasedPosition
} from "../../types/polymarket/positions/purchased-position.js";

export async function createOrder(client: ClobClient, position: ParsedPosition) {
    console.log("===============================================================");
    const isPositionPurchased = await getDbClient().checkIfExists(COLLECTION_NAME_PURCHASED_POSITION, {
        conditionId: position.conditionId,
        outcome: position.outcome,
    });

    if (isPositionPurchased) {
        console.log(`Position ${position.title} already purchased. Skipping.`);
        return;
    }

    // Get market info first
    const market = await client.getMarket(position.conditionId) as Market;

    if (!market.accepting_orders) {
        console.log(`Orders are not accepting for position ${position.title}. Skipping.`);
        return;
    }

    if (market.closed) {
        console.log(`Market is closed for position ${position.title}. Skipping.`);
        return;
    }

    console.log(market);

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
        const purchasedPosition: PurchasedPosition = {
            ...position,
            purchased: true,
            eventEndDate: market.end_date_iso,
            purchasePrice: buyToken.price,
            purchaseAmount: orderSharesAmount,
            purchasedAt: new Date()
        }

        await getDbClient().getCollection<PurchasedPosition>(COLLECTION_NAME_PURCHASED_POSITION).insertOne(purchasedPosition);
    }
}