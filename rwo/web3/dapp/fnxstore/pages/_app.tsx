import "../styles/globals.css";
import React from "react";
import { AppProps } from "next/app";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import Layout from "@/components/layout";

const getLibrary = (provider: any) => {
    return new ethers.providers.Web3Provider(provider);
};

function MyApp({ Component, pageProps, ...appProps }: AppProps) {
    const isWeb3Needed = [`/order`].includes(appProps.router.pathname);
    console.log(isWeb3Needed);
    return (
        <>
            {isWeb3Needed && (
                <Web3ReactProvider getLibrary={getLibrary}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </Web3ReactProvider>
            )}
            {!isWeb3Needed && (
                <Component {...pageProps} />
            )}
        </>
    );
}

export default MyApp;
