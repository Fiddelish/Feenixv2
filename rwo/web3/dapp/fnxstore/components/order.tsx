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
    const [order, setOrder] = useState<Order>();
    const [product, setProduct] = useState<Product>();
    const [totalAmount, setTotalAmount] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");

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
                if (!rResp.verified || !rResp.order) {
                    setVerified(false);
                    setOrder(undefined);
                    return;
                }
                setOrder(rResp.order);
                const cryptoStoreContract = getCryptoStoreContract();
                const pApi = getProductApi();
                combineLatest({
                    tokenSymbol: cryptoStoreContract.GetTokenSymbol(),
                    decimals: cryptoStoreContract.GetTokenDecimals(),
                    totalAmount: cryptoStoreContract.txInAmounts(txId),
                    product: pApi.getProductById(rResp.order.product_id)
                }).subscribe(
                    (resp) => {
                        setTotalAmount(toJSNumberString(resp.totalAmount as BigNumber, resp.decimals as number, 4));
                        setTokenSymbol(resp.tokenSymbol as string);
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
        if (!order) {
            return;
        }
        if (!confirm(`Are you sure you want to mark order ${order.id} as fulfilled?`)) {
            return;
        }
        const fr: FulfillOrderRequest = {
            tx_id: txId,
            token: token
        };
        const oApi = getOrderApi();
        const resp: FulfillOrderResponse = (await oApi.fulfillOrder(fr)).data;
        if (!resp.fulfilled) {
            alert(`Error marking order ${order.id} as fulfilled`);
        } else {
            retrieveData();
            alert(`Order ${order.id} was marked as fulfilled successfully`);
        }
    }
    return (
        <>
            {isVerified && (order !== undefined) && (product !== undefined) && (
                <div>
                    <div>
                        <table
                            className="table-auto
                                border-separate border-spacing-1
                                border border-slate-600"
                        >
                            <tbody>
                                <tr>
                                    <td className="border border-slate-400">Order ID:</td>
                                    <td className="border border-slate-400">{order.id}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-400">Product ID:</td>
                                    <td className="border border-slate-400">{order.product_id}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-400">Product Name:</td>
                                    <td className="border border-slate-400">{product.name}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-400">Transaction ID:</td>
                                    <td className="border border-slate-400">{order.tx_id}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-400">Transaction Hash:</td>
                                    <td className="border border-slate-400">{order.tx_hash}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-400">Total amount paid (with taxes):</td>
                                    <td className="border border-slate-400">{totalAmount} {tokenSymbol}</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-400">Order Status:</td>
                                    <td className="border border-slate-400">{order.status}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center py-4">
                        <button
                            className="w-48 rounded-md
                                bg-violet-500
                                py-2
                                px-4 font-bold text-white shadow-md shadow-violet-900 hover:bg-violet-600 focus:ring-0 focus:ring-offset-0 disabled:bg-gray-400 disabled:shadow-gray-900 disabled:shadow-sm active:shadow-sm active:shadow-violet-900"
                            onClick={markAsFulfilled}
                            disabled={order.status !== OrderStatus.Paid}
                        >
                            Mark as Fullfilled
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

