import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { orderApi } from "./api/order";
import { Order, RetrieveRequest, RetrieveResponse, FulfillRequest } from "rwo_ts_sdk";

export default function ProductList(
    { txId, token }:
        {
            txId: string,
            token: string
        }
) {
    const [isVerified, setVerified] = useState(false);
    const [order, setOrder] = useState<Order>(undefined);
    useEffect(() => {
        const rReq: RetrieveRequest = {
            tx_id: txId,
            token: token
        }
        const api = orderApi()
        const rResp: RetrieveResponse = api.retrieveOrder(rReq);
        if (rResp.verified) {
            setOrder(rResp.order);
            setVerified(true);
        }
    }, []);
    return (
        <div className="flex flex-wrap">
            {isVerified && (
                <div>
                    <div>Order ID:</div>
                    <div>{order.id}</div>
                </div>
            )}
        </div>
    );
}
