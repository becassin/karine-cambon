"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { clientFront } from "@/sanity/lib/client-front";
import { categoriesQuery } from "@/sanity/lib/queries";

type Category = {
  _id: string;
  title: string;
  slug: { current: string };
};

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    clientFront.fetch(categoriesQuery).then((data) => setCategories(data));
  }, []);

  // Desktop dropdown handlers with delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDesktopDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDesktopDropdownOpen(false);
    }, 200); // 200ms delay to allow smooth mouse movement
  };

  // Toggle mobile dropdown on click
  const toggleMobileDropdown = () => {
    setMobileDropdownOpen((prev) => !prev);
  };

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setMenuOpen(false);
    setMobileDropdownOpen(false);
  };

  return (
    <header className="fixed z-50 h-24 inset-0 bg-white/80 flex items-center backdrop-blur-lg px-4 sm:px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link className="flex items-center gap-2" href="/">
          <span className="lg:block text-lg font-semibold">
            Karine Cambon
          </span>
        </Link>

        {/* Burger button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            <li>
              <Link href="/about">À Propos</Link>
            </li>

            <li>
              <Link href="/guestbook">Livre d'Or</Link>
            </li>

            <li
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="cursor-pointer select-none px-4 py-2">
                Sculptures
              </span>
              {desktopDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/sculptures/${cat.slug.current}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDesktopDropdownOpen(false)}
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-24 left-0 w-full bg-white border-t z-40 shadow-md lg:hidden">
          <ul className="flex flex-col p-4 gap-2 text-sm font-medium">
            <li>
              <Link href="/about" onClick={closeMobileMenu}>
                About
              </Link>
            </li>

            <li>
              <button
                className="w-full flex justify-between items-center px-4 py-2 font-medium text-left bg-gray-100 rounded"
                onClick={toggleMobileDropdown}
                aria-expanded={mobileDropdownOpen}
                aria-controls="mobile-sculptures-dropdown"
              >
                Sculptures
                <svg
                  className={`h-5 w-5 ml-2 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {mobileDropdownOpen && (
                <div
                  id="mobile-sculptures-dropdown"
                  className="mt-1 pl-4 border-l border-gray-300"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/sculptures/${cat.slug.current}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={closeMobileMenu}
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            <li>
              <Link
                href="https://github.com/sanity-io/sanity-template-nextjs-clean"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black text-white px-4 py-2 rounded-full text-center"
                onClick={closeMobileMenu}
              >
                GitHub
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
