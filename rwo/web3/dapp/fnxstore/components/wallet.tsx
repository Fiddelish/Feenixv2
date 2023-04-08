import { useWeb3React } from "@web3-react/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import { connectors } from "./connectors";
import { truncateAddress } from "./utils";
import Modal from "react-modal";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function Wallet() {
    const { library, account, active, activate, deactivate } = useWeb3React();
    const [isOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    function closeModal() {
        setIsOpen(false);
    }
    const [error, setError] = useState("");
    const [network, setNetwork] = useState("");
    const [chainId, setChainId] = useState("");
    const [signedMessage, setSignedMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [message, setMessage] = useState("");
    const [verified, setVerified] = useState(false);

    function handleError(error: Error) {
        alert(`Error occurred: ${error.message}`);
        setError(error.message);
    }

    const handleNetwork = (e: any) => {
        const id = e.target.value;
        setNetwork(id);
    };

    const signMessage = async () => {
        if (!library) return;
        try {
            const signature = await library.provider.request({
                method: "personal_sign",
                params: [message, account],
            });
            setSignedMessage(message);
            setSignature(signature);
        } catch (error: any) {
            setError(error);
        }
    };

    const verifyMessage = async () => {
        if (!library) return;
        try {
            const verify = await library.provider.request({
                method: "personal_ecRecover",
                params: [signedMessage, signature],
            });
            setVerified(verify === account?.toLowerCase());
        } catch (error: any) {
            setError(error?.toString());
        }
    };

    useEffect(() => {
        const provider = window.localStorage.getItem("provider");
        if (provider === "injected") {
            activate(connectors.injected).then(() => {
                console.log(account, active, provider, connectors);
            });
        } else if (provider === "walletConnect") {
            activate(connectors.walletConnect).then(() => {
                console.log(account, active, provider, connectors);
            });
        } else if (provider === "coinbaseWallet") {
            activate(connectors.coinbaseWallet).then(() => {
                console.log(account, active, provider, connectors);
            });
        }
    }, [activate]);

    const setProvider = (type: string) => {
        window.localStorage.setItem("provider", type);
    };

    const refreshState = () => {
        window.localStorage.setItem("provider", "");
        setNetwork("");
        setMessage("");
        setSignature("");
        setVerified(false);
    };

    const disconnect = () => {
        refreshState();
        deactivate();
        console.log(`Disconnect; active: ${active}`);
    };

    function ProviderPicker() {
        return (
            <div className="flex w-48 flex-col items-center bg-transparent">
                <button
                    className="mb-4 flex w-full flex-row rounded-md bg-white px-4 py-6 shadow-lg"
                    onClick={() => {
                        setError("");
                        activate(
                            connectors.coinbaseWallet,
                            (error) => {
                                handleError(error);
                            },
                            false
                        );
                        setProvider("coinbaseWallet");
                        closeModal();
                    }}
                >
                    <Image src="/images/cbw.png" alt="Coinbase Wallet Logo" width={25} height={25} />
                    <span className="ml-2">Coinbase Wallet</span>
                </button>
                <button
                    className="mb-4 flex w-full flex-row rounded-md bg-white px-4 py-6 shadow-lg"
                    onClick={() => {
                        setError("");
                        activate(
                            connectors.injected,
                            (error) => {
                                handleError(error);
                            },
                            false
                        );
                        setProvider("injected");
                        closeModal();
                    }}
                >
                    <Image className="" src="/images/mm.png" alt="Metamask Logo" width={25} height={25} />
                    <span className="ml-2">Metamask Wallet</span>
                </button>

                {!!error ? (
                    <div className="flex flex-row items-center text-red-700">
                        <ExclamationCircleIcon width={32} height={32} />
                        <span className="ml-2 text-sm">{error}</span>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <>
            <div className="py-2 pr-6">
                {!active ? (
                    <button
                        type="button"
                        className="rounded-md
                            bg-violet-500
                            px-6
                            py-2.5
                            text-xs
                            font-semibold
                            uppercase
                            leading-tight
                            text-white
                            shadow-md
                            shadow-violet-900
                            transition
                            duration-150 ease-in-out
                            hover:bg-violet-600 focus:bg-violet-700 focus:outline-none
                            focus:ring-0
                            active:bg-violet-700
                            active:shadow-sm
                            active:shadow-violet-900"
                        onClick={openModal}
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <button
                        type="button"
                        className="rounded-md
                        bg-violet-500
                        px-6
                        py-2.5
                        text-xs
                        font-semibold
                        uppercase
                        leading-tight
                        text-white
                        shadow-md
                        shadow-violet-900
                        transition
                        duration-150 ease-in-out
                        hover:bg-violet-600 focus:bg-violet-700 focus:outline-none
                        focus:ring-0
                        active:bg-violet-700
                        active:shadow-sm
                        active:shadow-violet-900"
                        onClick={disconnect}
                    >
                        Disconnect Wallet
                    </button>
                )}
                {!account ? (
                    <div className="flex flex-row items-center gap-x-2 py-2">
                        <span className="text-sm">Supports</span>
                        <Image src="/images/mm.png" alt="Metamask Logo" width={25} height={25} />
                        <Image src="/images/cbw.png" alt="Coinbase Logo" width={25} height={25} />
                    </div>
                ) : (
                    <div className="">{`Account: ${truncateAddress(account)}`}</div>
                )}
            </div>
            <Modal
                isOpen={isOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={{
                    content: {
                        top: "33%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        marginRight: "-50%",
                        transform: "translate(-50%, -33%)",
                        backgroundColor: "#f5f5f4",
                    },
                    overlay: {
                        background: "rgba(0,0,0,0.8)",
                    },
                }}
                ariaHideApp={false}
            >
                <ProviderPicker />
            </Modal>
        </>
    );
}
