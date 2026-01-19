import {getDbClient} from "../../common/db.js";
import {COLLECTION_NAME_SOURCE_ACCOUNT, type SourceAccount} from "../../types/polymarket/account/source-account.js";
import {fetchAccountPositions} from "../positions/fetch-account-positions.js";
import {
    COLLECTION_NAME_PARSED_POSITION,
    type ParsedPosition
} from "../../types/polymarket/positions/parsed-position.js";
import moment from "moment";

/**
 * Parse positions for all source accounts
 */
export async function parsePositions() {
    const sourceAccounts = await getDbClient().getCollection<SourceAccount>(COLLECTION_NAME_SOURCE_ACCOUNT).find().toArray();

    for (const sourceAccount of sourceAccounts) {
        const accountPositions = await fetchAccountPositions(sourceAccount.address);

        let newCount = 0;

        await getDbClient().getCollection<ParsedPosition>(COLLECTION_NAME_PARSED_POSITION).updateMany({
            sourceAccount: sourceAccount.address,
        }, {
            $set: {
                existing: false,
            }
        });

        for (const accountPosition of accountPositions) {
            // if (accountPosition.slug === "lol-hle1-t1-2026-01-16") {
            //     console.log(accountPosition);
            // }

            const eventEndDatePosInSlug = accountPosition.slug.indexOf("202");
            if (eventEndDatePosInSlug === -1) {
                // console.log(`Could not find event date in slug: ${accountPosition.slug}`);
            } else {
                const eventEndDate = accountPosition.slug.substring(eventEndDatePosInSlug, eventEndDatePosInSlug + 10);

                // Skip position if event is over
                if (moment().isAfter(moment(`${eventEndDate}T23:59:59`))) {
                    // console.log(`Event is over (date found in slug): ${eventEndDate}`);
                    continue;
                }
            }

            const existingPosition = await getDbClient().getCollection<ParsedPosition>(COLLECTION_NAME_PARSED_POSITION).findOne({
                sourceAccount: sourceAccount.address,
                conditionId: accountPosition.conditionId,
                outcome: accountPosition.outcome
            });

            const position: ParsedPosition = {
                sourceAccount: sourceAccount.address,
                conditionId: accountPosition.conditionId,
                outcome: accountPosition.outcome,
                initialValue: accountPosition.initialValue,
                avgPrice: accountPosition.avgPrice,
                size: accountPosition.size,
                slug: accountPosition.slug,
                title: accountPosition.title,
                endDate: accountPosition.endDate,
                purchased: existingPosition?.purchased ?? false,
                existing: true,
                createdAt: existingPosition?.createdAt ?? new Date(),
                updatedAt: new Date(),
            }

            await getDbClient().getCollection<ParsedPosition>(COLLECTION_NAME_PARSED_POSITION).findOneAndUpdate({
                sourceAccount: sourceAccount.address,
                conditionId: accountPosition.conditionId,
                outcome: accountPosition.outcome
            }, {
                $set: position,
            }, {
                upsert: true,
            });

            // console.log("====================");
            // if (process.env.NODE_ENV !== "production") {
            //     if (existingPosition) {
            //         console.log("Position updated");
            //         console.log(`Event: ${accountPosition.title} (${accountPosition.slug})`);
            //         console.log(`Outcome: ${accountPosition.outcome}`);
            //         console.log(`Current value: ${accountPosition.initialValue}`);
            //         console.log(`Previous value: ${existingPosition.initialValue}`);
            //     } else {
            //         console.log("Found new position");
            //         console.log(`Event: ${accountPosition.title} (${accountPosition.conditionId})`);
            //         console.log(`Outcome: ${accountPosition.outcome}`);
            //         console.log(`Current value: ${accountPosition.initialValue}`);
            //         newCount++;
            //     }
            // }
        }

        await getDbClient().getCollection<ParsedPosition>(COLLECTION_NAME_PARSED_POSITION).deleteMany({
            sourceAccount: sourceAccount.address,
            existing: false,
            purchased: false,
        });

        console.log(`New positions for account ${sourceAccount.address} found: ${newCount}`);
    }
}