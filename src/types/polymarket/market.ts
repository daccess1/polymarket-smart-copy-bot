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
    accepting_order_timestamp: string | null;
    accepting_orders: boolean;
    active: boolean;
    archived: boolean;
    closed: boolean;
    condition_id: string;
    description: string;
    enable_order_book: boolean;
    end_date_iso: string;
    fpmm: string;
    game_start_time: string;
    icon: string;
    image: string;
    is_50_50_outcome: boolean;
    maker_base_fee: number;
    market_slug: string;
    minimum_order_size: number;
    minimum_tick_size: TickSize;
    neg_risk: boolean;
    neg_risk_market_id: string;
    neg_risk_request_id: string;
    notifications_enabled: boolean;
    question: string;
    question_id: string;
    rewards: {
        max_spread: number;
        min_size: number;
        rates: any | null;
    };
    seconds_delay: number;
    tags: string[];
    taker_base_fee: number;
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