import React, { useState } from "react";
import Image from "next/image";
import useModal from "use-react-modal";
import { Product } from "rwo_ts_sdk";
import Buy from "./buy";

export default function ProductCard({ product }: { product: Product }) {
    const { isOpen, openModal, closeModal, Modal } = useModal({
        // sets the color of the backdrop, if nothing is set, the backdrop will be transparent unless it's set in the Provider
        // setting to `null` removes any background set in the `Provider`
        background: "rgba(0, 0, 0, 0.8)",
        // `event` has all the fields that a normal `event` would have such as `event.target.value`, etc.
        // with the additional `portal` and `targetEl` added to it as seen in the examples below
        onOpen: (event) => {
            // can access: event.portal, event.targetEl, event.event, event.target, etc.
        },
        // `onClose` will not have an `event` unless you pass an `event` to `closePortal`
        onClose({ targetEl, event, portal }) {},
    });

    return (
        <>
            <div
                className="flex flex-col bg-stone-100 rounded-md
                    shadow-2xl shadow-black m-6
                    overflow-hidden w-64 h-80
                    gap-y-5"
            >
                <Image
                    className="object-cover"
                    priority
                    placeholder="empty"
                    src={`/images/${product.id}.png`}
                    width={150}
                    height={120}
                    alt=""
                ></Image>
                <div className="px-8 py-2 text-stone-800">
                    <div className="font-bold text-xl mb-2">{product.name}</div>
                    <div className="text-md text-stone-600 mb-2">{product.description}</div>
                </div>
                <div className="flex w-full justify-center">
                    <button
                        className="bg-orange-500 hover:bg-orange-600
                            text-white font-bold py-2 px-4 rounded-md w-32"
                        onClick={openModal}
                    >
                        {product.price / 100} USDC
                    </button>
                </div>
            </div>
            {isOpen && (
                <Modal>
                    <Buy product={product} />
                </Modal>
            )}
        </>
    );
}
