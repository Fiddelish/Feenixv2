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
            href: "/contact",
            title: "Contact",
        },
        {
            href: "/about",
            title: "About",
        },
    ];
    return (
        <div className="flex justify-center">
            <div className="min-w-full">
                <header className="sticky top-2 bg-lime-50 shadow-xl">
                    <nav className="flex flex-col bg-gradient-to-r from-green-300 to-lime-300 pb-2 lg:flex-row">
                        <div className="absolute top-2 right-2 ">
                            <Wallet />
                        </div>
                        <div className="mt-12 flex flex-col-reverse pl-1 sm:flex-row">
                            {menuItems.map(({ href, title }) => (
                                <div
                                    className={`h-8 w-28 border-l-4 px-1 sm:w-auto sm:border-b-4 sm:border-l-0 ${
                                        router.asPath === href ? "border-green-600" : "border-transparent"
                                    }`}
                                    key={href}
                                >
                                    <Link className="px-2 hover:bg-green-400" href={href}>
                                        {title}
                                    </Link>
                                </div>
                            ))}
                        </div>
                        {router.asPath === "/" && (
                            <div className="my-4 mx-4 flex h-6 w-auto flex-row rounded-md border-stone-900 bg-white sm:w-72 lg:mt-12 lg:w-1/3">
                                <input type="text" className="flex w-full bg-transparent pl-6 focus:outline-0" />
                                <button className="absolute mt-1">
                                    <MagnifyingGlassIcon className="h-4 pl-1" />
                                </button>
                            </div>
                        )}
                    </nav>
                </header>
                <main className="w-full bg-lime-50 p-8">{children}</main>
            </div>
        </div>
    );
}
