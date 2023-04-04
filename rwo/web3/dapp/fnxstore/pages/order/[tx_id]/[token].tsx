import React from "react";
import { useRouter } from "next/router";
import Order from "@/components/order";

export default function OrderPage() {
    const router = useRouter()
    const { tx_id, token } = router.query;

    return (
        <div className="flex h-full flex-col justify-center items-center">
            <Order txId={tx_id} token={token} />
        </div>
    );
}
