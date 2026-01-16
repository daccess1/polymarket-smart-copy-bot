import {getDbClient} from "../../common/db.js";
import {
    COLLECTION_NAME_PARSED_POSITION,
    type ParsedPosition
} from "../../types/polymarket/positions/parsed-position.js";
import {COLLECTION_NAME_SOURCE_ACCOUNT, type SourceAccount} from "../../types/polymarket/account/source-account.js";

/**
 * Find all positions that fit purchase conditions
 */
export async function findFittingPositions() {
    const fittingPositions: ParsedPosition[] = [];

    const accounts = await getDbClient().getCollection<SourceAccount>(COLLECTION_NAME_SOURCE_ACCOUNT).find().toArray();

    for (const account of accounts) {
        const positions = await getDbClient().getCollection<ParsedPosition>(COLLECTION_NAME_PARSED_POSITION).find({
            purchased: false,
            sourceAccount: account.address,
        }).toArray();

        for (const position of positions) {
            // Skip position if a source account has spent less than minimum amount
            if (position.initialValue < account.minAmount) {
                continue;
            }

            // Skip position if it is already purchased by another account
            const existingPositionFromOtherAccount = fittingPositions.find(existingPosition => position.conditionId === existingPosition.conditionId);

            if (existingPositionFromOtherAccount) {
                continue;
            }

            fittingPositions.push(position);
        }
    }

    return fittingPositions;
}