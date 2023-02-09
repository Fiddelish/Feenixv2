import { useRouter } from "next/router";
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Wallet from "./wallet";

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
                    <nav>
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
                                <li className='m-2' key={title}>
                                    <Link href={href}>
                                        <a
                                        className={`flex p-2 rounded cursor-pointer ${
                                            router.asPath === href && 'bg-blue-800 text-white'
                                        }`}
                                        >
                                        {title}
                                        </a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <div className="min-h-screen flex flex-col w-full">
                    <header
                        className="sticky top-0 h-14 flex justify-between p-8 items-center font-semibold uppercase"
                    >
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