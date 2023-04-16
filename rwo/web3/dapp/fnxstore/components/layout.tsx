import { useRouter } from "next/router";
import { ReactNode } from "react";
import Link from "next/link";
import Wallet from "./wallet";
import Search from "./search";

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
                        <div className="mt-3 flex flex-col-reverse pl-1 sm:mt-12 sm:flex-row">
                            {menuItems.map(({ href, title }) => (
                                <div
                                    className={`h-6 w-28 border-l-4 px-1 sm:w-auto sm:border-b-4 sm:border-l-0 ${
                                        router.asPath === href ? "border-green-600" : "border-transparent"
                                    }`}
                                    key={href}
                                >
                                    <Link className="px-2" href={href}>
                                        {title}
                                    </Link>
                                </div>
                            ))}
                        </div>
                        {router.asPath === "/" && <Search />}
                    </nav>
                </header>
                <main className="w-full bg-lime-50 p-8">{children}</main>
            </div>
        </div>
    );
}
