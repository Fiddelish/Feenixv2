import { useRouter } from "next/router";
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Wallet from "./wallet";
import {
    SearchIcon,
} from "@heroicons/react/outline";

export default function Layout(
    {
        children
    }:
    {
        children: ReactNode
    }
) {
    const router = useRouter();

    const menuItems = [
        {
            href: '/',
            title: 'Products',
        },
        {
            href: '/partners',
            title: 'Partners',
        },
        {
            href: '/about',
            title: 'About',
        },
        {
            href: '/contact',
            title: 'Contact',
        },
    ];
    return (
        <>
            <div className="flex flex-col md:flex-row flex-1">
                <aside className="bg-gray-700 w-full md:w-60">
                    <nav className="">
                        <ul>
                            <li>
                                <Image
                                    className=""
                                    src={`/images/logo.png`}
                                    width={240}
                                    height={110}
                                    alt=""
                                >
                                </Image>
                            </li>
                        </ul>
                        <ul>
                            {menuItems.map(({ href, title }) => (
                                <li className='m-2 ' key={title}>
                                    <Link href={href}>
                                        <a
                                        className={`flex justify-center p-2 cursor-pointer bg-blue-600 text-white rounded-xl hover:bg-blue-900 ${
                                            router.asPath === href && 'bg-blue-800 text-white rounded-xl hover:bg-blue-900'
                                        }`}
                                        >
                                        {title}
                                        </a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ul className="absolute bottom-1">
                            <li className="">
                                <div className="flex justify-celnter items-center p-2">
                                    <input
                                        type="text"
                                        className="rounded-xl h-8 text-gray-700 w-36"
                                    />
                                    <button>
                                        <SearchIcon className="h-4 m-4"></SearchIcon>
                                    </button>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center px-4 pb-4 gap-x-2">
                                    <span className="text-sm">Supports</span>
                                    <Image
                                        src="/images/mm.png"
                                        alt="Metamask Logo"
                                        width={25}
                                        height={25}
                                    />
                                    <Image
                                        src="/images/cbw.png"
                                        alt="Coinbase Logo"
                                        width={25}
                                        height={25}
                                    />
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <div className="min-h-screen flex flex-col w-full">
                    <header
                        className="sticky top-0 h-14 flex justify-between p-8 items-center font-semibold uppercase"
                    >
                        <div>
                            <p>Catagori</p>
                        </div>
                        <div>
                            <p>Feenix Crypto Store</p>
                        </div>
                        <div>
                            <Wallet/>
                        </div>
                    </header>
                    <main className="p-8 w-full">{children}</main>
                </div>
            </div>
        </>
    );
}