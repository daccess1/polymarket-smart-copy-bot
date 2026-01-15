import axios from "axios";
import type {AccountPosition} from "../../types/polymarket/positions/account-position.js";

/**
 * Fetch positions for address
 *
 * @param address
 */
export async function fetchAccountPositions(address: string) {
    const response = await axios.get<AccountPosition[]>(`https://data-api.polymarket.com/positions?sizeThreshold=1&limit=100&sortBy=CURRENT&sortDirection=DESC&user=${address}`);

    return response.data;
}