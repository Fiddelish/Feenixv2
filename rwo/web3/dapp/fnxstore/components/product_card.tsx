import React from "react";
import Image from "next/image";
import { Product } from "rwo_ts_sdk";
import { useWeb3React } from "@web3-react/core";

export default function ProductCard(
    { product }: 
    { product: Product }
) {
    function buyProduct() {
        window.alert(`Buying product ${product.name} for ${product.price / 100} USDC`);
    }
    
    return (
        <>
            <div
                className="flex flex-col bg-gray-600 rounded-lg
                    shadow-2xl shadow-black w-full m-6
                    overflow-hidden sm:w-64 sm:h-80
                    gap-y-5"
            >
                <Image
                    className=""
                    src={`/images/${product.id}.png`}
                    width={150}
                    height={120}
                    alt=""
                >
                </Image>
                <div className="px-8 py-2">
                    <div className="font-bold text-xl mb-2">{product.name}</div>
                    <div className="font-bold text-md mb-2">{product.description}</div>
                    <p className="text-base">
                        Price: {product.price / 100} USDC
                    </p>
                </div>
                <div className="flex justify-around py-2">
                    <button
                        className="bg-blue-700 hover:bg-blue-900
                            text-white font-bold py-2 px-4 rounded-full"
                        onClick={buyProduct}
                    >
                        Buy
                    </button>
                </div>
            </div>
        </>
    )
}
