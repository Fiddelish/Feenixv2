import { useRouter } from "next/router";
import { ReactNode } from "react";
import Link from "next/link";
import Wallet from "./wallet";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
                        <div className="flex justify-end border-b-2 border-white bg-gradient-to-r from-green-300 to-lime-300">
                            <Wallet />
                        </div>
                        <div className="flex flex-col pt-4 pl-2 sm:flex-row">
                            {menuItems.map(({ href, title }) => (
                                <div key={href}>
                                    <Link
                                        href={href}
                                        className={`cursor-pointer rounded-sm px-6 outline-stone-900 hover:outline  ${
                                            router.asPath === href && "font-semibold"
                                        }`}
                                    >
                                        {title}
                                    </Link>
                                </div>
                            ))}
                            <div className="ml-4 flex h-6 flex-row rounded-sm border-stone-900 bg-white">
                                <input
                                    type="text"
                                    className="w-36 bg-transparent pl-6 focus:border-transparent focus:ring-transparent"
                                />
                                <button className="absolute mt-1">
                                    <MagnifyingGlassIcon className="h-4 pl-1" />
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>
                <main className="w-full p-8">{children}</main>
            </div>
        </>
    );
}
