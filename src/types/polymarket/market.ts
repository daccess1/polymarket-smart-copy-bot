import type {TickSize} from "@polymarket/clob-client";

export interface Market {
    condition_id: string;
    minimum_order_size: number;
    minimum_tick_size: TickSize;
    neg_risk: boolean;
    tokens: MarketToken[];
}

export interface MarketToken {
    token_id: string;
    outcome: string;
    price: number;
    winner: boolean;
}