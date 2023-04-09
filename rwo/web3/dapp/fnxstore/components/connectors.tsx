import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

export const injected = new InjectedConnector({
    supportedChainIds: [137, 80001, 31337],
});

const walletConnect = new WalletConnectConnector({
    rpc: [`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`],
    chainId: 1,
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
});

const walletLink = new WalletLinkConnector({
    url: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    appName: "rwo-fnx-store",
});

export const connectors = {
    injected: injected,
    walletConnect: walletConnect,
    coinbaseWallet: walletLink,
};
