import { useWeb3React} from "@web3-react/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import { connectors } from "./connectors";
import { truncateAddress } from "./utils";


export default function Wallet() {

    const { library, account, active, activate, deactivate } = useWeb3React();
    const [error, setError] = useState("");
    const [network, setNetwork] = useState(undefined);
    const [chainId, setChainId] = useState("");
    const [signedMessage, setSignedMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [message, setMessage] = useState("");
    const [verified, setVerified] = useState(false);

    function handleError(error: Error) {
        alert(`Error occurred: ${error.message}`);
        setError(error.message)
    }

    const handleNetwork = (e) => {
        const id = e.target.value;
        setNetwork(id);
    };

    const signMessage = async () => {
        if (!library) return;
        try {
        const signature = await library.provider.request({
            method: "personal_sign",
            params: [message, account]
        });
        setSignedMessage(message);
        setSignature(signature);
        } catch (error) {
        setError(error);
        }
    };
    
    const verifyMessage = async () => {
        if (!library) return;
        try {
            const verify = await library.provider.request({
                method: "personal_ecRecover",
                params: [signedMessage, signature]
            });
            setVerified(verify === account.toLowerCase());
        } catch (error) {
            setError(error);
        }
    };

    useEffect(() => {
        const provider = window.localStorage.getItem("provider");
        if (provider) {
            activate(connectors[provider]).then(() => {
                console.log(account, active, provider, connectors);
            })
        }
    }, [activate]);

    const setProvider = (type) => {
        window.localStorage.setItem("provider", type);
    };

    const refreshState = () => {
        window.localStorage.setItem("provider", undefined);
        setNetwork("");
        setMessage("");
        setSignature("");
        setVerified(undefined);
    };

    const disconnect = () => {
        refreshState();
        deactivate();
        console.log(`Disconnect; active: ${active}`)
    };

    return(
        <>
            <div className="w-48">
                {!active ? (
                    <button
                        type="button"
                        className="px-6
                            py-2.5
                            bg-blue-600
                            text-white
                            font-medium
                            text-xs
                            leading-tight
                            uppercase
                            rounded-xl
                            shadow-md
                            hover:bg-blue-700 hover:shadow-lg
                            focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
                            active:bg-blue-900 active:shadow-lg
                            transition
                            duration-150
                            ease-in-out"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                    >Connect Wallet</button>
                ) : (
                    <div className="flex flex-col">
                        <button
                            type="button"
                            className="px-6 py-2.5
                                bg-blue-600
                                text-white
                                font-medium
                                text-xs
                                leading-tight
                                uppercase
                                rounded
                                shadow-md
                                hover:bg-blue-700 hover:shadow-lg
                                focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
                                active:bg-blue-900 active:shadow-lg
                                transition
                                duration-150
                                ease-in-out"
                            onClick={disconnect}
                        >Disconnect Wallet</button>
                    </div>
                )}
                {!account ? null : (
                    <p className="text-white">{`Account: ${truncateAddress(account)}`}</p>
                )}
            </div>
            <div className="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
            id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog relative w-auto pointer-events-none">
                    <div className="modal-content shadow-lg
                        flex justify-center flex-col pointer-events-auto
                        bg-gray-600 rounded-md outline-none
                        text-current border"
                    >
                        <div className="modal-header flex items-center
                            justify-between p-4 border-b border-gray-200 rounded-t-md border"
                        >
                            <h5 className="text-xl font-medium
                                leading-normal text-white"
                                id="exampleModalLabel"
                            >
                                Connect Wallet
                            </h5>
                        </div>
                        <div className="flex justify-around p-2">
                            <div>
                                <button
                                    data-bs-dismiss="modal"
                                    onClick={() => {
                                        setError("");
                                        activate(
                                            connectors.coinbaseWallet,
                                            (error) => { handleError(error); },
                                            false
                                        );
                                        setProvider("coinbaseWallet");
                                    }}
                                >
                                    <Image
                                        src="/images/cbw.png"
                                        alt="Coinbase Wallet Logo"
                                        width={25}
                                        height={25}
                                    />
                                    <p>Coinbase Wallet</p>
                                </button>
                            </div>
                            <div>
                                <button
                                    data-bs-dismiss="modal"
                                    onClick={() => {
                                        setError("");
                                        activate(
                                            connectors.injected,
                                            (error) => { handleError(error); },
                                            false
                                        );
                                        setProvider("injected");
                                    }}
                                >
                                    <Image
                                        src="/images/mm.png"
                                        alt="Metamask Logo"
                                        width={25}
                                        height={25}
                                    />
                                    <p>Metamask Wallet</p>
                                </button>
                            </div>
                            <div>
                                <button
                                    data-bs-dismiss="modal"
                                    onClick={() => {
                                        setError("");
                                        activate(
                                            connectors.walletConnect,
                                            (error) => { handleError(error); },
                                            false
                                        );
                                        setProvider("walletConnect");
                                    }}
                                >
                                    <Image
                                        src="/images/wc.png"
                                        alt="Wallet Connect Logo"
                                        width={25}
                                        height={25}
                                    />
                                    <p>Wallet Connect</p>
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer flex flex-shrink-0 flex-wrap
                            items-center justify-end p-4 border-t border-gray-200 rounded-b-md"
                        >
                            <div className="text-black">{error}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
