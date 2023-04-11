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
        <div className="flex justify-center">
            <div className="min-w-full">
                <header className="sticky top-0 bg-lime-50 shadow-xl">
                    <nav className="flex items-end justify-between bg-gradient-to-r from-green-300 to-lime-300">
                        <div className="flex flex-col py-4 pl-1 sm:flex-row ">
                            {menuItems.map(({ href, title }) => (
                                <div key={href}>
                                    <Link
                                        href={href}
                                        className={`cursor-pointer border-green-600 outline-green-600 hover:outline sm:px-4  ${
                                            router.asPath === href ? "border-b-4" : "border-none"
                                        }`}
                                    >
                                        {title}
                                    </Link>
                                </div>
                            ))}
                        </div>
                        {router.asPath === "/" && (
                            <div className="my-4 flex h-6 w-1/4 flex-row rounded-md border-stone-900 bg-white px-1 lg:mx-4">
                                <input
                                    type="text"
                                    className="w-36 bg-transparent pl-6 focus:border-transparent focus:ring-transparent"
                                />
                                <button className="absolute mt-1">
                                    <MagnifyingGlassIcon className="h-4 pl-1" />
                                </button>
                            </div>
                        )}
                        <div className="">
                            <Wallet />
                        </div>
                    </nav>
                </header>
                <main className="w-full bg-lime-50 p-8">{children}</main>
            </div>
        </div>
    );
}
