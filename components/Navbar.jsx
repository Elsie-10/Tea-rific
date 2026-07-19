"use client";

import Link from "next/link";
import {
  ShoppingCart, Menu, X, LogOut,
  LayoutDashboard, ClipboardList,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { totalItems }      = useCart();
  const { data: session }   = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dropRef = useRef(null);

  const isOwner    = session?.user?.role === "owner";
  const isCustomer = session && !isOwner;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function getInitials(name = "") {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <nav className="bg-white border-b border-[#F2E0D0] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold font-serif text-[#6B3F1F]">Tea-Terrific</span>
          <span className="text-xs text-[#4A7C59] font-medium hidden sm:block tracking-widest uppercase">
            Bakery
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/"
            className="text-sm font-medium text-gray-600 hover:text-[#6B3F1F] transition">
            Menu
          </Link>
          <Link href="/about"
            className="text-sm font-medium text-gray-600 hover:text-[#6B3F1F] transition">
            About
          </Link>
          {isCustomer && (
            <Link href="/orders"
              className="text-sm font-medium text-gray-600 hover:text-[#6B3F1F] transition">
              My Orders
            </Link>
          )}
          {isOwner && (
            <Link href="/owner/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-[#6B3F1F] transition">
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Cart — customers and guests only */}
          {!isOwner && (
            <Link href="/cart"
              className="relative p-2 hover:bg-[#FDF8F0] rounded-full transition">
              <ShoppingCart className="w-5 h-5 text-[#6B3F1F]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4A843] text-white
                                 text-[10px] font-bold w-5 h-5 rounded-full
                                 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Signed in */}
          {session ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                           hover:bg-[#FDF8F0] transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#6B3F1F] flex items-center
                                justify-center text-white text-xs font-bold">
                  {getInitials(session.user.name)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#2C2C2C]
                                 max-w-[100px] truncate">
                  {session.user.name}
                </span>
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl
                                shadow-lg border border-[#F2E0D0] py-1 z-50">

                  {/* Role + email */}
                  <div className="px-4 py-2 border-b border-[#F2E0D0]">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {isOwner ? "Owner" : "Customer"}
                    </p>
                    <p className="text-sm text-[#2C2C2C] truncate">{session.user.email}</p>
                  </div>

                  {/* Owner links */}
                  {isOwner && (
                    <Link href="/owner/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm
                                 text-gray-700 hover:bg-[#FDF8F0]"
                      onClick={() => setUserOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  )}

                  {/* Customer links */}
                  {isCustomer && (
                    <Link href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm
                                 text-gray-700 hover:bg-[#FDF8F0]"
                      onClick={() => setUserOpen(false)}>
                      <ClipboardList className="w-4 h-4" /> My Orders
                    </Link>
                  )}

                  {/* Sign out */}
                  <button
                    onClick={() => {
                      setUserOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm
                               text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>

          ) : (
            /* Not signed in */
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login"
                className="text-sm font-semibold text-[#6B3F1F] px-4 py-2
                           rounded-lg hover:bg-[#FDF8F0] transition">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-primary !py-2 !px-4 text-sm">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 hover:bg-[#FDF8F0] rounded-full"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#F2E0D0] bg-white px-4 py-3
                        flex flex-col gap-1">
          <Link href="/" className="text-sm font-medium py-2 text-gray-700"
            onClick={() => setMenuOpen(false)}>
            Menu
          </Link>
          <Link href="/about" className="text-sm font-medium py-2 text-gray-700"
            onClick={() => setMenuOpen(false)}>
            About
          </Link>

          {isCustomer && (
            <Link href="/orders" className="text-sm font-medium py-2 text-gray-700"
              onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
          )}

          {isOwner && (
            <Link href="/owner/dashboard" className="text-sm font-medium py-2 text-gray-700"
              onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}

          {!session ? (
            <>
              <Link href="/auth/login"
                className="text-sm font-medium py-2 text-[#6B3F1F]"
                onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link href="/auth/signup"
                className="text-sm font-medium py-2 text-[#6B3F1F]"
                onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm font-medium py-2 text-red-600 text-left"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}