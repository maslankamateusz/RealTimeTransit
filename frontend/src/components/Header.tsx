import React, { useState } from 'react';
import Logo from '../assets/logo.png';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
                <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src={Logo} className="h-10" alt="KMK Logo" />
                    <a href="#" className="self-center text-lg sm:text-2xl font-semibold whitespace-nowrap dark:text-white">
                        RealTimeTransit
                    </a>
                </a>

                <button
                    onClick={toggleMenu}
                    className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
                    aria-controls="navbar-hamburger"
                    aria-expanded={isMenuOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 17 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 1h15M1 7h15M1 13h15"
                        />
                    </svg>
                </button>

                <div
                    className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}
                    id="navbar-hamburger"
                >
                    <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
                        <li>
                            <a
                                href="#"
                                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:dark:hover:text-blue-500"
                            >
                                Mapa
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:dark:hover:text-blue-500"
                            >
                                Linie
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:dark:hover:text-blue-500"
                            >
                                Przystanki
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:dark:hover:text-blue-500"
                            >
                                Statystyka
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
