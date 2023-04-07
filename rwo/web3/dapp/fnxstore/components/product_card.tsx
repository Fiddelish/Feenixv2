import React, { useState, useEffect } from "react";
import { combineLatest } from "rxjs";
import { BigNumber } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Product } from "rwo_ts_sdk";
import { getCryptoStoreContract } from "@/contract_wrappers/contracts";
import Image from "next/image";
import Modal from "react-modal";
import Buy from "./buy";
import { toJSNumberString } from "./currency";

export default function ProductCard({ product }: { product: Product }) {
    const [isOpen, setIsOpen] = useState(false);
    const [price, setPrice] = useState("");
    const [totalFees, setTotalFees] = useState("");
    const { active } = useWeb3React();

    useEffect(() => {
        if (active) {
            retrievePriceAndFees();
        }
    }, [active]);

    function retrievePriceAndFees() {
        const cryptoStoreContract = getCryptoStoreContract();
        combineLatest({
            decimals: cryptoStoreContract.GetTokenDecimals(),
            productPrice: cryptoStoreContract.productPrices(product.id),
            totalFees: cryptoStoreContract.TotalFees(),
        }).subscribe(
            data => {
                setPrice(toJSNumberString(data.productPrice as BigNumber, data.decimals as number));
                setTotalFees((data.totalFees as BigNumber).toString());
            }
        );
    }

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    function closeModal() {
        setIsOpen(false);
    }

    return (
        <>
            <div
                className="m-6 flex h-80 w-64
                    flex-col gap-y-5 overflow-hidden
                    rounded-md bg-stone-100 shadow-2xl
                    shadow-black"
            >
                <Image
                    priority
                    className="h-40 w-64 object-cover"
                    src={`/images/${product.id}.png`}
                    width="0"
                    height="0"
                    sizes="100vw"
                    alt=""
                />
                <div className="h-16 overflow-hidden px-8 text-stone-800 ">
                    <div className="text-xl font-bold">{product.name}</div>
                    <div className="text-md mb-2 text-stone-600">{product.description}</div>
                </div>
                {active && (
                    <div className="flex w-full justify-center">
                        <button
                            className="w-40 rounded-md
                            bg-violet-500
                            py-2
                            px-4 font-bold text-white shadow-md shadow-violet-900 hover:bg-violet-600 focus:ring-0 focus:ring-offset-0 disabled:bg-gray-400 disabled:shadow-gray-900 disabled:shadow-sm active:shadow-sm active:shadow-violet-900"
                            onClick={openModal}
                            disabled={!active}
                        >
                            {price} USDC
                        </button>
                    </div>
                )}
                {!active && (
                    <div className="flex w-full justify-center">
                        <p
                            className="w-40 py-2 px-4 font-bold"
                        >
                            Connect wallet to see prices
                        </p>
                    </div>
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
                <Buy product={product} close={closeModal} />
            </Modal>
        </>
    );
}
