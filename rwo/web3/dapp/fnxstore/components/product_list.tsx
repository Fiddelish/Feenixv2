import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import ProductCard from "./product_card";
import { FilterState, initialFilterState, filterState$ } from "./product_filter";
import { getProductApi } from "./api/product";
import { Product } from "rwo_ts_sdk";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [filter, setFilter] = useState(initialFilterState);
    const { active } = useWeb3React();
    useEffect(() => {
        setLoading(true);
        const api = getProductApi();
        api.getProducts().then((value) => {
            setProducts(value.data);
            setLoading(false);
        });
        const filterSub = filterState$.subscribe((filterState) => {
            setFilter(filterState);
        });
        return () => filterSub.unsubscribe();
    }, []);

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="flex flex-wrap place-content-evenly">
            {products
                .filter((p) => p.name.toLowerCase().includes(filter.queryString.toLowerCase()))
                .map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
        </div>
    );
}
