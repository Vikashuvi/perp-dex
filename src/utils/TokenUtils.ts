import { ethers } from "ethers";
import type { Token, TokenBalance } from '../types/Token';

export const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
];

export const formatTokenBalance = (balance: string, decimals: number):
    string => {
    return ethers.formatUnits(balance, decimals);
};

export const getTokenBalance = async (
    tokenAddress: string,
    walletAddress: string,
    provider: ethers.JsonRpcProvider
): Promise<string> => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(walletAddress);
        return balance.toString();
    } catch (error) {
        console.error(`Error fetching balance for token ${tokenAddress}:`, error);
        return "0";
    }
};

export const getTokenBalances = async (
    tokens: Token[],
    walletAddress: string,
    provider: ethers.JsonRpcProvider
): Promise<TokenBalance[]> => {
    const balances: TokenBalance[] = [];

    for (const token of tokens) {
        try {
            const rawBalance = await getTokenBalance(token.address, walletAddress, provider);
            const formattedBalance = formatTokenBalance(rawBalance, token.decimals);

            balances.push({
                token,
                balance: rawBalance,
                formattedBalance
            });
        } catch (error) {
            console.error(`Error processing token ${token.symbol}:`, error);
        }
    }

    return balances;
};