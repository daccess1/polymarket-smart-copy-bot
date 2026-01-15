import type {WithId} from "../../../common/db.js";

/**
 * MongoDB collection name for parsed positions
 */
export const COLLECTION_NAME_PARSED_POSITION = "parsedPosition";

/**
 * Position for bot
 *
 * @param sourceAccount source account address
 * @param conditionId condition id (used to search market api)
 * @param outcome outcome of the condition predicted by source account
 * @param initialValue total money spent by a source account
 * @param avgPrice average price of the position for a source account
 * @param size total shares of the position for a source account
 * @param purchased true if position is purchased by bot account, false if position is not purchased
 * @param purchasePrice price of a single share of the position for bot account
 * @param purchaseAmount amount of shares of the position for bot account
 * @param purchasedAt date of purchase of the position for bot account
 */
export interface ParsedPosition extends WithId<any> {
    sourceAccount: string;
    conditionId: string;
    outcome: string;
    initialValue: number;
    avgPrice: number;
    size: number;
    purchased: boolean;
    purchasePrice?: number;
    purchaseAmount?: number;
    purchasedAt?: Date;
}