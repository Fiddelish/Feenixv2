import React, { useState } from "react";
import Image from "next/image";
import { Product } from "rwo_ts_sdk";
import { useWeb3React } from "@web3-react/core";

export default function Buy(
    { product }: 
    { product: Product }
) {
    const [ shouldApprove, setShouldApprove ] = useState<Boolean>(true);

    function approveTokens() {
        alert(`Approving ${product.price} tokens`);
        setShouldApprove(!shouldApprove);
    }

    function purchaseProduct() {
        alert(`Purchasing ${product.name}`);
        setShouldApprove(true);
    }

    return(
        <>
            <div
                className="flex flex-col bg-gray-600 rounded-lg
                    shadow-2xl shadow-black
                    overflow-hidden
                    gap-y-5 p-4"
            >
                <Image
                    className=""
                    src={`/images/${product.id}.png`}
                    width={90}
                    height={90}
                    alt=""
                >
                </Image>
                <div className="columns-2">
                    <div className="w-32">
                        Email:
                    </div>
                    <div className="">
                        <input
                            type="text"
                            placeholder="user@example.com"
                            className="text-blue-600 w-42"
                        ></input>
                    </div>
                    <div className="w-32">
                        Confirm Email:
                    </div>
                    <div className="">
                        <input
                            type="text"
                            placeholder="user@example.com"
                            className="text-blue-600 w-42"
                        ></input>
                    </div>
                </div>
                <div className="px-8 py-2">
                    <div className="font-bold text-xl">{product.name}</div>
                    <div className="font-bold text-md">{product.description}</div>
                    <p className="text-base">
                        Price: {product.price / 100} USDC
                    </p>
                </div>
                <div className="flex justify-around py-2">
                    {shouldApprove && (
                        <button
                            className="bg-blue-700 hover:bg-blue-900
                                text-white font-bold py-2 px-4 rounded-full"
                            onClick={approveTokens}
                        >
                            Approve
                        </button>
                    )}
                    {!shouldApprove && (
                        <button
                            className="bg-blue-700 hover:bg-blue-900
                                text-white font-bold py-2 px-4 rounded-full"
                            onClick={purchaseProduct}
                        >
                            Purchase
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}