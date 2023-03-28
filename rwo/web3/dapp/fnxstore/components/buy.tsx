import React, { useState, useEffect } from "react";
import { useWeb3React} from "@web3-react/core";
import Image from "next/image";
import { Product } from "rwo_ts_sdk";
import { combineLatest } from "rxjs";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { UserIcon as UserIconOutline } from "@heroicons/react/24/outline";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { getCryptoStoreContract } from "@/contract_wrappers/crypto_store";
import { ethers, BigNumber, ContractTransaction } from "ethers";
import { toJSNumber } from "./currency";

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
    const [ approvedAmount, setApprovedAmount ] = useState<BigNumber>(BigNumber.from(0));
    const [ productPrice, setProductPrice ] = useState(0);
    const [ totalFees, setTotalFees ] = useState(0);
    const [ fullPrice, setFullPrice ] = useState<BigNumber>(BigNumber.from(0));
    const [ shouldApprove, setShouldApprove ] = useState<Boolean>(true);
    const formMethods = useForm<IEmailInputs>({ mode: "onSubmit" });

    function approveTokens() {
        alert(`Approving ${product.price} tokens`);
        setShouldApprove(!shouldApprove);
    }

    function purchaseProduct() {
        alert(`Purchasing ${product.name}`);
        setShouldApprove(true);
    }

    function ActionButton() {
        const { control } = useFormContext();
        const email1 = useWatch({ control, name: "email1", defaultValue: null });
        const email2 = useWatch({ control, name: "email2", defaultValue: null });
        const email1Valid = validateEmail(email1);
        const email2Valid = validateEmail(email2);
        return email1Valid && email2Valid && email1 === email2 ? (
            <button
                className="w-full rounded-sm bg-violet-500
                py-2 px-4 font-bold text-white hover:bg-violet-600"
                onClick={!!shouldApprove ? approveTokens : purchaseProduct}
            >
                {!!shouldApprove ? "Approve" : "Purchase for"} {product.price} USDC
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
        updateApprovedAmount();
    }, []);

    function updateApprovedAmount() {
        const cryptoStoreContract = getCryptoStoreContract();
        combineLatest({
            decimals: cryptoStoreContract.GetTokenDecimals(),
            allowance: cryptoStoreContract.GetAllowance(account),
            productPrice: cryptoStoreContract.productPrices(product.id),
            totalFees: cryptoStoreContract.TotalFees(),
            fullPrice: cryptoStoreContract.GetPriceWithFees(product.id),
        }).subscribe(
            data => {
                const decimals: number = data.decimals as number;
                const allowance: BigNumber = data.allowance as BigNumber;
                setProductPrice(toJSNumber(data.productPrice as BigNumber, decimals));
                setTotalFees(data.totalFees as number);
                setFullPrice(data.fullPrice as BigNumber);
                if (allowance < fullPrice) {
                    setApprovedAmount(BigNumber.from(0));
                } else {
                    setApprovedAmount(fullPrice);
                }
            }
        );
    }

    async function approve() {
        const cryptoStoreContract = getCryptoStoreContract();
        const decimals = await cryptoStoreContract.GetTokenDecimals();
        const txApproval: ContractTransaction = await cryptoStoreContract.ApproveTokens(
            fullPrice
        );
        await txApproval.wait();
        updateApprovedAmount();
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
                    <div className="flex w-full">
                        <ActionButton />
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
