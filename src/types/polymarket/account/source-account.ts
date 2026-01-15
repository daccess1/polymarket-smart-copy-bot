/**
 * MongoDB collection name for source accounts
 */
export const COLLECTION_NAME_SOURCE_ACCOUNT = "sourceAccount";

/**
 * Polymarket source account
 *
 * @param address source account address
 * @param polymarketUrl polymarket url
 * @param minAmount minimum amount of tokens to copy trade
 */
export interface SourceAccount {
    address: string;
    polymarketUrl: string;
    minAmount: number;
}