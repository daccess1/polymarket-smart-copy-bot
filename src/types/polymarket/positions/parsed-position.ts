import type {WithId} from "../../../common/db.js";

/**
 * MongoDB collection name for parsed positions
 */
export const COLLECTION_NAME_PARSED_POSITION = "parsedPosition";

/**
 * Position found during parsing from Polymarket API
 *
 * @param sourceAccount source account address
 * @param conditionId condition id (used to search market api)
 * @param outcome outcome of the condition predicted by source account
 * @param initialValue total money spent by a source account
 * @param avgPrice average price of the position for a source account
 * @param size total shares of the position for a source account
 * @param slug slug of the event for a position
 * @param title title of the event for a position
 * @param endDate some weird date that do not correspond with actual event date, idk what that means
 * @param existing true if position is found during parsing
 * @param purchased true if position is purchased by bot account, false if position is not purchased
 */
export interface ParsedPosition extends WithId<any> {
    sourceAccount: string;
    conditionId: string;
    outcome: string;
    initialValue: number;
    avgPrice: number;
    size: number;
    slug: string;
    title: string;
    endDate: string;
    purchased: boolean;
    existing: boolean;
    createdAt: Date;
    updatedAt?: Date;
}