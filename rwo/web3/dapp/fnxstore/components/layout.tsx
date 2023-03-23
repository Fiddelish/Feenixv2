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
                        <div className="flex bg-gradient-to-r from-sky-700 to-sky-600 justify-end border-b-2 border-white">
                            <Wallet />
                        </div>
                        <div className="flex flex-col sm:flex-row pt-4 pl-2">
                            {menuItems.map(({ href, title }) => (
                                <div key={href}>
                                    <Link
                                        href={href}
                                        className={`px-6 cursor-pointer hover:outline outline-stone-900 rounded-sm  ${
                                            router.asPath === href && "font-semibold"
                                        }`}
                                    >
                                        {title}
                                    </Link>
                                </div>
                            ))}
                            <div className="flex flex-row pl-6">
                                <input
                                    type="text"
                                    className="rounded-sm h-6 border-stone-900 focus:border-transparent focus:ring-orange-900 w-36"
                                />
                                <button>
                                    <MagnifyingGlassIcon className="pl-1 h-4" />
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
