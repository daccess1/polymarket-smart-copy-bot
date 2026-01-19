import type {ParsedPosition} from "./parsed-position.js";

/**
 * MongoDB collection name for purchased positions
 */
export const COLLECTION_NAME_PURCHASED_POSITION = "purchasedPosition";

/**
 * Purchased position
 *
 * @extends ParsedPosition
 *
 * @param eventEndDate event end date
 * @param purchasePrice price of a single share of the position for bot account
 * @param purchaseAmount amount of shares of the position for bot account
 * @param purchasedAt date of purchase of the position for bot account
 */
export interface PurchasedPosition extends ParsedPosition {
    eventEndDate: string;
    purchasePrice: number;
    purchaseAmount: number;
    purchasedAt: Date;
}