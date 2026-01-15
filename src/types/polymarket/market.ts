import type {TickSize} from "@polymarket/clob-client";

/**
 * Market response from Polymarket API
 *
 * @param condition_id condition id (used to search market api)
 * @param minimum_order_size minimum order size
 * @param minimum_tick_size minimum tick size
 * @param neg_risk negative risk
 * @param tokens tokens for market
 */
export interface Market {
    condition_id: string;
    minimum_order_size: number;
    minimum_tick_size: TickSize;
    neg_risk: boolean;
    tokens: MarketToken[];
}

/**
 * Tokens response from Polymarket API market request
 *
 * @param token_id token id, used for purchasing by bot
 * @param outcome outcome of the event, used for purchasing by bot
 * @param price current price of the token
 * @param winner
 */
export interface MarketToken {
    token_id: string;
    outcome: string;
    price: number;
    winner: boolean;
}