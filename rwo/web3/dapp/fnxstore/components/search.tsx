import { useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { filterState$ } from "./product_filter";

export default function Search() {
    let timer: NodeJS.Timer | null;
    const query = useRef("");
    function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (timer != null) {
            clearInterval(timer);
            timer = null;
        }
        query.current = e.target.value;
        timer = setTimeout(() => {
            filterState$.next({ queryString: query.current });
        }, 500);
    }
    return (
        <div className="my-4 mx-4 flex h-6 w-auto flex-row rounded-md border-stone-900 bg-white sm:w-72 lg:mt-12 lg:w-1/3">
            <input
                type="text"
                className="flex w-full bg-transparent pl-6 focus:outline-0"
                onChange={handleQueryChange}
            />
            <button className="absolute mt-1">
                <MagnifyingGlassIcon className="h-4 pl-1" />
            </button>
        </div>
    );
}
