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
          <svg
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            className="text-red-500 h-7 sm:h-10 rounded-full"
          >
            <title>Sanity</title>
            <g clipPath="url(#clip0_1_821)">
              <rect width="128" height="128" fill="currentColor" />
              <path
                d="M39.4229 33.1629C39.4229 44.1614 46.3362 50.7055 60.1767 54.1563L74.8429 57.4971C87.9417 60.453 95.9185 67.7945 95.9185 79.7554C96.0204 84.9662 94.296 90.053 91.0345 94.1634C91.0345 82.23 84.751 75.7822 69.595 71.9052L55.1947 68.6881C43.6633 66.1035 34.7628 60.068 34.7628 47.076C34.7021 42.0589 36.3415 37.1644 39.4229 33.1629"
                fill="white"
              />
              <path
                d="M82.0221 76.827C88.2776 80.759 91.0206 86.2583 91.0206 94.1497C85.8426 100.666 76.7462 104.323 66.0545 104.323C48.0576 104.323 35.4626 95.6207 32.6637 80.4978H49.9468C52.172 87.4406 58.0636 90.6577 65.9285 90.6577C75.5287 90.6577 81.9102 85.6258 82.0361 76.7995"
                fill="#F9B1AB"
              />
              <path
                d="M48.4074 49.4682C45.5509 47.8004 43.2073 45.404 41.6255 42.5332C40.0437 39.6624 39.2825 36.4244 39.423 33.1629C44.419 26.7013 53.1095 22.7556 63.7033 22.7556C82.0361 22.7556 92.6439 32.2693 95.2608 45.66H78.6354C76.8021 40.3807 72.212 36.27 63.8433 36.27C54.9008 36.27 48.7992 41.3843 48.4494 49.4682"
                fill="#F9B1AB"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_821">
                <rect width="128" height="128" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="hidden lg:block text-lg pl-2 font-semibold">
            Sanity + Next.js
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
              <Link href="/about">About</Link>
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
