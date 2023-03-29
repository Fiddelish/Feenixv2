import React, { useState, useEffect } from "react";
import { useWeb3React} from "@web3-react/core";
import Image from "next/image";
import {
    Product,
    SubmitOrderRequest,
    SubmitOrderResponse,
    VerifyOrderPaymentRequest,
} from "rwo_ts_sdk";
import { combineLatest } from "rxjs";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { getCryptoStoreContract, getTokenContract, CRYPTO_STORE_CONTRACT } from "@/contract_wrappers/contracts";
import { ethers, BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { toJSNumber, toJSNumberString } from "./currency";
import { getOrderApi } from "./api/order";

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
    const { account, active } = useWeb3React();
    const [ decimals, setDecimals ] = useState(0);
    const [ productPrice, setProductPrice ] = useState("");
    const [ totalFees, setTotalFees ] = useState("");
    const [ fullPrice, setFullPrice ] = useState<BigNumber>(BigNumber.from(0));
    const [ shouldApprove, setShouldApprove ] = useState(false);
    const formMethods = useForm<IEmailInputs>({ mode: "onSubmit" });
    const { handleSubmit } = useForm();

    async function approve() {
        const tokenContract = getTokenContract();
        const txApproval: ContractTransaction = await tokenContract.approve(
            CRYPTO_STORE_CONTRACT,
            fullPrice
        );
        await txApproval.wait();
        updateApproval();
    }

    async function purchaseProduct(email: string) {
        const orderApi = getOrderApi();
        if (!account) {
            return;
        }
        const sor: SubmitOrderRequest = {
            email: email,
            product_id: product.id,
            quantity: 1,
            wallet: account,
        }
        const resp = (await orderApi.submitOrder(sor).catch(
            (reason) => {
                alert(`Submit order failed: ${reason}`);
            }
        ))?.data;
        if (!resp) {
            return;
        }
        const txId: string = resp.tx_id;
        const cryptoStoreContract = getCryptoStoreContract();
        const txPayment: ContractTransaction = await cryptoStoreContract.MakePayment(
            product.id, fullPrice, txId
        );
        const txReceipt: ContractReceipt = await txPayment.wait();
        const txHash = txReceipt.transactionHash;
        const vopr: VerifyOrderPaymentRequest = {
            tx_id: txId,
            tx_hash: txHash,
            amount: toJSNumber(fullPrice, decimals),
        }
        orderApi.verifyOrder(vopr).then(
            (resp) => {
                alert(`Order verified: ${resp.data.verified}!`);
            },
            (reason) => {
                alert(`Order rejected: ${reason}`);
            }
        )
    }

    function ActionButton() {
        const { control } = useFormContext();
        const email1 = useWatch({ control, name: "email1", defaultValue: null });
        const email2 = useWatch({ control, name: "email2", defaultValue: null });
        const email1Valid = validateEmail(email1);
        const email2Valid = validateEmail(email2);

        async function purchase() {
            await purchaseProduct(email1);
        }
        return email1Valid && email2Valid && email1 === email2 ? (
            <button
                className="w-full rounded-sm bg-violet-500
                py-2 px-4 font-bold text-white hover:bg-violet-600"
                onClick={shouldApprove ? approve : purchase}
            >
                {shouldApprove ? "Approve" : "Purchase for"} {productPrice} + fees ({totalFees}%) USDC
            </button>
        ) : (
            <button
                disabled
                className="w-full rounded-sm bg-stone-500
            py-2 px-4 font-bold text-white"
            >
                {!email1Valid ? "Need valid email..." : "... and email confirmation"}
            </button>
        );
    }

    function UserIcon({ id }: { id: string }) {
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
                <UserIcon id={id} />
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

    useEffect(() => {
        if (!active) {
            return;
        }
        updateApproval();
    }, []);

    function updateApproval() {
        const cryptoStoreContract = getCryptoStoreContract();
        combineLatest({
            decimals: cryptoStoreContract.GetTokenDecimals(),
            allowance: cryptoStoreContract.GetAllowance(),
            productPrice: cryptoStoreContract.productPrices(product.id),
            totalFees: cryptoStoreContract.TotalFees(),
            fullPrice: cryptoStoreContract.GetPriceWithFees(product.id),
        }).subscribe(
            data => {
                const allowance: BigNumber = data.allowance as BigNumber;
                const localFullPrice: BigNumber = data.fullPrice as BigNumber;
                setDecimals(data.decimals as number);
                setProductPrice(toJSNumberString(data.productPrice as BigNumber, data.decimals as number));
                setTotalFees((data.totalFees as BigNumber).toString());
                setFullPrice(localFullPrice);
                if (allowance < localFullPrice) {
                    setShouldApprove(true);
                } else {
                    setShouldApprove(false);
                }
            }
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
                <div className="text-md ">{productPrice} USDC + fees ({totalFees}%)</div>
            </div>
            <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit((data) => {})}>
                    <div className="mb-2 gap-1 sm:columns-2">
                        <EmailInput id="email1" />
                        <EmailInput id="email2" />
                    </div>
                    <div className="flex w-full">
                        <ActionButton />
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
