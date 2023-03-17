import { useRouter } from "next/router";
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Wallet from "./wallet";
import { SearchIcon } from "@heroicons/react/outline";

export default function Layout({ children }: { children: ReactNode }) {
    const router = useRouter();

    const menuItems = [
        {
            href: "/",
            title: "Products",
        },
        {
            href: "/partners",
            title: "Partners",
        },
        {
            href: "/about",
            title: "About",
        },
        {
            href: "/contact",
            title: "Contact",
        },
    ];
    return (
        <>
            <div>
                <header>
                    <nav>
                        <div className="grid bg-blue-900 place-items-end border-b-2 border-white">
                            <Wallet />
                        </div>
                        <div className="flex flex-row pt-4">
                            {menuItems.map(({ href, title }) => (
                                <Link href={href}>
                                    <a
                                        className={`px-6 cursor-pointer rounded-sm  ${
                                            router.asPath === href && "font-bold"
                                        }`}
                                    >
                                        {title}
                                    </a>
                                </Link>
                            ))}
                            <div className="flex flex-row">
                                <input
                                    type="text"
                                    className="rounded-sm h-6 border-orange-800 focus:border-transparent focus:ring-orange-900 w-36"
                                />
                                <button>
                                    <SearchIcon className="h-4"></SearchIcon>
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>
                <main className="p-8 w-full">{children}</main>
            </div>
        </>
    );
}
