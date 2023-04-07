import React from "react";
import { useRouter } from "next/router";
import Order from "@/components/order";

export default function OrderPage() {
    const router = useRouter()
    const { tx_id, token } = router.query;

    if (!tx_id || !token) {
        return (
            <>
                <p>Invalid order details</p>
            </>
        );
    }
    return (
        <div className="flex h-full flex-col justify-center items-center">
            <Order txId={tx_id.toString()} token={token.toString()} />
        </div>
    );
}
