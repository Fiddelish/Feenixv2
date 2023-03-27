import React, { useState } from "react";
import Image from "next/image";
import { Product } from "rwo_ts_sdk";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";

const validateEmail = (email: string) =>
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
    );

interface IEmailInputs {
    email1: string;
    email2: string;
}

export default function Buy({ product }: { product: Product }) {
    const [shouldApprove, setShouldApprove] = useState<Boolean>(true);
    const formMethods = useForm<IEmailInputs>({ mode: "onSubmit" });

    function approveTokens() {
        alert(`Approving ${product.price} tokens`);
        setShouldApprove(!shouldApprove);
    }

    function purchaseProduct() {
        alert(`Purchasing ${product.name}`);
        setShouldApprove(true);
    }

    function ApproveButton() {
        const { control } = useFormContext();
        const email1 = useWatch({ control, name: "email1", defaultValue: null });
        const email2 = useWatch({ control, name: "email2", defaultValue: null });
        return email1 === email2 && validateEmail(email1) && validateEmail(email2) ? (
            <button
                className="w-full rounded-sm bg-violet-500
    py-2 px-4 font-bold text-white hover:bg-violet-600"
                onClick={approveTokens}
            >
                Approve {product.price} USDC
            </button>
        ) : (
            <button
                disabled
                className="w-full rounded-sm bg-stone-500
            py-2 px-4 font-bold text-white"
            >
                Need valid email and confirmation
            </button>
        );
    }

    function PurchaseButton() {
        return (
            <button
                className="w-full rounded-sm bg-violet-500
py-2 px-4 font-bold text-white hover:bg-violet-600"
                onClick={purchaseProduct}
            >
                Purchase for {product.price} USDC
            </button>
        );
    }
    function UserIconWatch({ id }: { id: string }) {
        const { control } = useFormContext();
        return !!validateEmail(useWatch({ control, name: id, defaultValue: null })) ? (
            <UserIconSolid className="mt-1 h-4 text-stone-600" />
        ) : (
            <UserIconOutline className="mt-1 h-4 text-stone-600" />
        );
    }
    function EmailInput({ id }: { id: string }) {
        const { register } = useFormContext();

        return (
            <div className="flex flex-row rounded-sm border bg-white px-2 py-1">
                <UserIconWatch id={id} />
                <input
                    type="text"
                    placeholder="user@example.com"
                    className="ml-1 w-40 pl-1 focus:ring-0 focus:ring-offset-0"
                    {...register(id, {
                        required: true,
                        validate: (email) => {
                            return validateEmail(email);
                        },
                    })}
                />
            </div>
        );
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
            <FormProvider {...formMethods}>
                <form>
                    <div className="mb-2 gap-1 sm:columns-2">
                        <EmailInput id="email1" />
                        <EmailInput id="email2" />
                    </div>
                    <div className="flex w-full">{shouldApprove ? <ApproveButton /> : <PurchaseButton />}</div>
                </form>
            </FormProvider>
        </div>
    );
}
