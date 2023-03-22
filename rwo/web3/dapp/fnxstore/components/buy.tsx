import React, { useState } from "react";
import Image from "next/image";
import { Product } from "rwo_ts_sdk";
import { useWeb3React } from "@web3-react/core";

export default function Buy({ product }: { product: Product }) {
    const [shouldApprove, setShouldApprove] = useState<Boolean>(true);

    function approveTokens() {
        alert(`Approving ${product.price} tokens`);
        setShouldApprove(!shouldApprove);
    }

    function purchaseProduct() {
        alert(`Purchasing ${product.name}`);
        setShouldApprove(true);
    }

    return (
        <>
            <div
                className="flex flex-col bg-stone-100 text-stone-800 rounded-lg
                    shadow-2xl shadow-black
                    overflow-hidden
                    gap-y-5 p-4"
            >
                <Image
                    className="object-cover"
                    src={`/images/${product.id}.png`}
                    width={150}
                    height={150}
                    alt=""
                ></Image>
                <div className="px-8 py-2">
                    <div className="font-bold text-xl">{product.name}</div>
                    <div className="text-md text-stone-600">{product.description}</div>
                    <div className="font-bold mt-2">Price: {product.price / 100} USDC</div>
                </div>
                <div className="columns-2">
                    <div className="w-32 pl-3">Email:</div>
                    <div className="">
                        <input
                            type="text"
                            placeholder="user@example.com"
                            className="text-orange-900 border-transparent focus:border-transparent focus:ring-orange-900 rounded-sm w-42"
                        ></input>
                    </div>
                    <div className="w-32 pl-3">Confirmation:</div>
                    <div className="">
                        <input
                            type="text"
                            placeholder="user@example.com"
                            className="text-orange-900 border-transparent focus:border-transparent focus:ring-orange-900 rounded-sm w-42"
                        ></input>
                    </div>
                </div>
                <div className="flex justify-around py-2">
                    {shouldApprove && (
                        <button
                            className="w-full bg-orange-600 hover:bg-orange-800
                                text-white font-bold py-2 px-4 rounded-sm"
                            onClick={approveTokens}
                        >
                            Approve
                        </button>
                    )}
                    {!shouldApprove && (
                        <button
                            className="w-full bg-orange-600 hover:bg-orange-800
                                text-white font-bold py-2 px-4 rounded-sm"
                            onClick={purchaseProduct}
                        >
                            Purchase
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
