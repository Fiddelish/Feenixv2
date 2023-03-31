import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import ProductCard from "./product_card";
import { getProductApi } from "./api/product";
import { Product } from "rwo_ts_sdk";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setLoading] = useState(false);
    const { active } = useWeb3React();
    useEffect(() => {
        setLoading(true);
        const api = getProductApi();
        api.getProducts().then((value) => {
            setProducts(value.data);
            setLoading(false);
        });
    }, []);
    return (
        <div className="flex flex-wrap">
            {!isLoading && products.map((p) => <ProductCard key={p.id} product={p} />)}
            {isLoading && <p>Loading...</p>}
        </div>
    );
}
