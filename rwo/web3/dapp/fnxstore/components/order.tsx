import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { orderApi } from "./api/order";
import { Order, RetrieveRequest, FulfillRequest } from "rwo_ts_sdk";

export default function ProductList(
    { txId }:
        { txId: string }
) {
    const [isVerified, setVerified] = useState(false);
    const [order, setOrder] = useState<Order>(undefined);
    function retrieveOrder(token) {
        const rReq: RetrieveRequest = {
            tx_id: txId,
            token: token
        }
        api = orderApi()
        const rResp: RetrieveResponse = api.retrieveOrder(rReq);
        if (rResp.verified) {
            setOrder(rResp.order);
            setVerified(true);
        }
    }
    return (
        <div className="flex flex-wrap">
            {!isVerified && (
                <div>
                    <div>Enter order token:</div>
                    <div><input type="text"></input></div>
                    <div><input type="button">Retrieve Order</input>
                    </div>
            )}
                    {isVerified && (
                <
            )}
                </div>
            );
}
