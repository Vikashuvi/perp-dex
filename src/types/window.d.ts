interface Window {
    ethereum?: {
        currentProvider: string | FetchRequest | undefined;
        isMetaMask?: boolean;
        request: (request: { method: string; params?: any[] }) => Promise<any>;
        on: (eventName: string, callback: (...args: any[]) => void) => void;
        removeListener: (eventName: string, callback: (...args: any[]) => void) => void;

        selectedAddress?: string;
        networkVersion?: string;
        chainId?: string;
        isConnected?: () => boolean;
    }
}