/**
 * Position response from Polymarket API
 *
 * @see https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user
 *
 * @param proxyWallet account wallet address
 * @param conditionId condition id (used to search market api)
 * @param outcome outcome of the condition predicted by source account
 * @param initialValue total money spent by a source account
 * @param avgPrice average price of the position for a source account
 * @param size total shares of the position for a source account
 * @param endDate date of expiration of the position
 */
export interface AccountPosition {
    proxyWallet: string;
    asset: string;
    conditionId: string;
    size: number;
    avgPrice: number;
    initialValue: number;
    currentValue: number;
    cashPnl: number;
    percentPnl: number;
    totalBought: number;
    realizedPnl: number;
    percentRealizedPnl: number;
    curPrice: number;
    redeemable: boolean;
    mergeable: boolean;
    title: string;
    slug: string;
    icon: string;
    eventId: string;
    eventSlug: string;
    outcome: string;
    outcomeIndex: number;
    oppositeOutcome: string;
    oppositeAsset: string;
    endDate: string;
    negativeRisk: boolean;
}