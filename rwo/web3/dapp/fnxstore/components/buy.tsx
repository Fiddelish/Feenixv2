import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import Image from "next/image";
import { Product, SubmitOrderRequest, SubmitOrderResponse, VerifyOrderPaymentRequest } from "rwo_ts_sdk";
import { combineLatest } from "rxjs";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { getCryptoStoreContract, getTokenContract, CRYPTO_STORE_CONTRACT } from "@/contract_wrappers/contracts";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { toJSNumberString } from "./currency";
import { getOrderApi } from "./api/order";
import { FancyPrice } from "./price";

const validateEmail = (email: string) =>
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
    );

interface IEmailInputs {
    email1: string;
    email2: string;
}

export default function Buy({ product, close }: { product: Product; close: () => void }) {
    const { account, active } = useWeb3React();
    const [inTx, setInTx] = useState(false);
    const [productPrice, setProductPrice] = useState("");
    const [totalFees, setTotalFees] = useState("");
    const [fullPrice, setFullPrice] = useState<BigNumber>(BigNumber.from(0));
    const [shouldApprove, setShouldApprove] = useState(false);
    const formMethods = useForm<IEmailInputs>({ mode: "onSubmit" });
    const { handleSubmit } = useForm();

    async function approve() {
        setInTx(true);
        try {
            const tokenContract = getTokenContract();
            const txApproval: ContractTransaction = await (
                tokenContract.approve(CRYPTO_STORE_CONTRACT, fullPrice).catch((error: any) => {
                    alert(`Error approving funds: ${error.reason}`)
                })
            );
            if (!txApproval) {
                return;
            }
            await txApproval.wait();
        } finally {
            updateApproval();
            setInTx(false);
        }
    }

    async function purchaseProduct(email: string) {
        setInTx(true);
        const orderApi = getOrderApi();
        if (!account) {
            return;
        }
        const sor: SubmitOrderRequest = {
            email: email,
            product_id: product.id,
            quantity: 1,
            wallet: account,
        };
        const resp = (
            await orderApi.submitOrder(sor).catch((reason) => {
                alert(`Submit order failed: ${reason}`);
            })
        )?.data;
        if (!resp) {
            updateApproval();
            setInTx(false);
            return;
        }
        const txId: string = resp.tx_id;
        const cryptoStoreContract = getCryptoStoreContract();
        const txPayment: ContractTransaction = await (
            cryptoStoreContract.MakePayment(product.id, fullPrice, txId).catch((error: any) => {
                alert(`Error making payment: ${error.reason}`);
            })
        );
        if (!txPayment) {
            updateApproval();
            setInTx(false);
            return;
        }
        const txReceipt: ContractReceipt = await txPayment.wait();
        const txHash = txReceipt.transactionHash;
        const vopr: VerifyOrderPaymentRequest = {
            tx_id: txId,
            tx_hash: txHash,
            amount: fullPrice.toNumber(),
        };
        orderApi
            .verifyOrder(vopr)
            .then(
                (resp) => {
                    alert(`Order verified successfully!`);
                },
                (reason) => {
                    alert(`Order rejected: ${reason}`);
                }
            )
            .finally(() => {
                updateApproval();
                close();
                setInTx(false);
            });
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
        if (email1Valid && email2Valid && email1 === email2) {
            return (
                <button
                    className="w-full rounded-sm bg-violet-500 py-2 px-4 shadow-sm shadow-gray-900 hover:bg-violet-600 focus:outline-0 active:shadow-none disabled:bg-gray-400"
                    onClick={shouldApprove ? approve : purchase}
                    disabled={!!inTx}
                >
                    <div className="flex items-center justify-center gap-1 font-bold text-white">
                        {!!inTx
                            ? shouldApprove
                                ? "Approving..."
                                : "Purchasing..."
                            : shouldApprove
                            ? "Approve"
                            : "Purchase"}
                        {!!inTx && (
                            <svg className="h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                        )}
                    </div>
                </button>
            );
        } else {
            return (
                <button disabled className="w-full rounded-sm bg-stone-500 py-2 px-4 font-bold text-white shadow-sm">
                    {!email1Valid ? "Need valid email..." : "... and email confirmation"}
                </button>
            );
        }
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
            <div className="flex w-72 flex-row rounded-sm border bg-white py-1 pl-1">
                <UserIcon id={id} />
                <input
                    type="text"
                    disabled={!!inTx}
                    placeholder="user@example.com"
                    className="ml-1 w-full pl-1 focus:outline-0 disabled:bg-transparent"
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
        }).subscribe((data) => {
            const allowance: BigNumber = data.allowance as BigNumber;
            const localFullPrice: BigNumber = data.fullPrice as BigNumber;
            console.log(toJSNumberString(allowance, 6, 4));
            console.log(toJSNumberString(localFullPrice, 6, 4));
            setProductPrice(toJSNumberString(data.productPrice as BigNumber, data.decimals as number));
            setTotalFees((data.totalFees as BigNumber).toString());
            setFullPrice(localFullPrice);
            if (allowance.lt(localFullPrice)) {
                setShouldApprove(true);
                console.log("SHOULD approve");
            } else {
                setShouldApprove(false);
                console.log("should NOT approve");
            }
        });
    }

    return (
        <div className="flex flex-col items-center">
            <Image
                priority
                className="h-48 w-80 rounded-md border object-cover"
                width={0}
                height={0}
                sizes="100vw"
                src={`/images/${product.id}.png`}
                alt=""
            />
            <div className="my-2 px-8">
                <div className="text-xl font-bold">{product.name}</div>
                <div className="text-sm ">{product.description}</div>
                <div className="text-md mt-2">
                    <span className="font-bold">
                        Total: <FancyPrice price={productPrice} currency="USDC" /> + {totalFees}% fees
                    </span>
                </div>
            </div>
            <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit((data) => {})}>
                    <div className="rows-2 mb-2 space-y-1">
                        <EmailInput id="email1" />
                        <EmailInput id="email2" />
                    </div>
                    <div className="justify-center">
                        <ActionButton />
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
