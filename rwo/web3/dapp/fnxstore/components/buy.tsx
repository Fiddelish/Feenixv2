import React, { useState } from "react";
import Image from "next/image";
import { Product } from "rwo_ts_sdk";
import { UserIcon } from "@heroicons/react/24/solid";

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
        <div className="flex flex-col items-center">
            <Image
                priority
                className="h-32 w-64 border object-cover"
                width={0}
                height={0}
                sizes="100vw"
                src={`/images/${product.id}.png`}
                alt=""
            />
            <div className="my-2 px-8 py-2">
                <div className="text-xl font-bold">{product.name}</div>
                <div className="text-md ">{product.description}</div>
            </div>
            <div className="mb-2 gap-1 sm:columns-2">
                <div className="flex flex-row rounded-sm border bg-white px-2 py-1">
                    <UserIcon className="mt-1 h-4 text-stone-600" />
                    <input
                        type="text"
                        placeholder="user@example.com"
                        className="ml-1 w-40 pl-1 focus:ring-0 focus:ring-offset-0"
                    />
                </div>
                <div className="flex flex-row rounded-sm border bg-white px-2 py-1">
                    <UserIcon className="mt-1 h-4 text-stone-600" />
                    <input
                        type="text"
                        placeholder="user@example.com"
                        className="ml-1 w-40 pl-1 focus:ring-0 focus:ring-offset-0"
                    />
                </div>
            </div>
            <div className="flex w-full">
                {shouldApprove && (
                    <button
                        className="w-full rounded-sm bg-violet-500
                        py-2 px-4 font-bold text-white hover:bg-violet-600"
                        onClick={approveTokens}
                    >
                        Approve {product.price} USDC
                    </button>
                )}
                {!shouldApprove && (
                    <button
                        className="w-full rounded-sm bg-violet-500
                        py-2 px-4 font-bold text-white hover:bg-violet-600"
                        onClick={purchaseProduct}
                    >
                        Purchase for {product.price} USDC
                    </button>
                )}
            </div>
        </div>
    );
}
