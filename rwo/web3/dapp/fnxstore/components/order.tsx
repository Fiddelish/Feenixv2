import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { getOrderApi } from "./api/order";
import { getProductApi } from "./api/product";
import { combineLatest } from "rxjs";
import {
    Order, OrderStatus, Product,
    RetrieveOrderRequest, RetrieveOrderResponse,
    FulfillOrderRequest, FulfillOrderResponse
} from "rwo_ts_sdk";
import {
    getCryptoStoreContract,
} from "@/contract_wrappers/contracts";
import { BigNumber } from "ethers";
import { toJSNumberString } from "./currency";

export default function ProductList(
    { txId, token }:
        {
            txId: string,
            token: string
        }
) {
    const [isVerified, setVerified] = useState(false);
    const [order, setOrder] = useState<Order>(undefined);
    const [product, setProduct] = useState<Product>(undefined);
    const [totalAmount, setTotalAmount] = useState("");
    const [tokenName, setTokenName] = useState("");

    function retrieveOrder() {
        const rReq: RetrieveOrderRequest = {
            tx_id: txId,
            token: token
        }
        const oApi = getOrderApi();
        return oApi.retrieveOrder(rReq)
    }

    function retrieveData() {
        retrieveOrder().then(
            (resp) => {
                const rResp: RetrieveOrderResponse = resp.data;
                if (!rResp.verified) {
                    return;
                }
                setOrder(rResp.order);
                const cryptoStoreContract = getCryptoStoreContract();
                const pApi = getProductApi();
                combineLatest({
                    tokenName: cryptoStoreContract.GetTokenName(),
                    decimals: cryptoStoreContract.GetTokenDecimals(),
                    totalAmount: cryptoStoreContract.txInAmounts(txId),
                    product: pApi.getProductById(resp.order.product_id)
                }).subscribe(
                    (resp) => {
                        setTotalAmount(toJSNumberString(resp.totalAmount as BigNumber, resp.decimals as number));
                        setTokenName(resp.tokenName as string);
                        const product: Product = resp.product.data;
                        setProduct(product);
                        setVerified(true);
                    }
                );
            }
        );
    }

    useEffect(() => {
        retrieveData();
    }, []);

    async function markAsFulfilled() {
        if (!confirm(`Are you sure you want to mark order ${order.id} as fulfilled?`)) {
            return;
        }
        const fr: FulfillOrderRequest = {
            tx_id: txId,
            token: token
        };
        const oApi = getOrderApi();
        const resp: FulfillOrderResponse = await oApi.fulfillOrder(fr);
        if (!resp.fulfilled) {
            alert(`Error marking order ${order.id} as fulfilled`);
        } else {
            retrieveData();
            alert(`Order ${order.id} was marked as fulfilled successfully`);
        }
    }
    return (
        <>
            {isVerified && (
                <div
                    className="m-6 flex h-80 w-64
                        flex-col gap-y-5 overflow-hidden
                        rounded-md bg-stone-100 shadow-2xl
                        shadow-black"
                >
                    <div className="grid grid-cols-2">
                        <div>Order Date:</div>
                        <div>{order.timestamp}</div>
                        <div>Order ID:</div>
                        <div>{order.id}</div>
                        <div>Product ID:</div>
                        <div>{order.product_id}</div>
                        <div>Product Name:</div>
                        <div>{product.name}</div>
                        <div>Transaction ID:</div>
                        <div>{order.tx_id}</div>
                        <div>Transaction Hash:</div>
                        <div>{order.tx_hash}</div>
                        <div>Total amount paid (with taxes):</div>
                        <div>{totalAmount} {tokenName}</div>
                        <div>Order Status:</div>
                        <div>{order.status}</div>
                    </div>
                    <div>
                        <button
                            className="w-32 rounded-md
                                bg-violet-500
                                py-2
                                px-4 font-bold text-white shadow-md shadow-violet-900 hover:bg-violet-600 focus:ring-0 focus:ring-offset-0 disabled:bg-gray-400 disabled:shadow-gray-900 disabled:shadow-sm active:shadow-sm active:shadow-violet-900"
                            onClick={markAsFulfilled}
                            disabled={order.status === OrderStatus.paid}
                        >
                            Mark as Fullfilled
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
