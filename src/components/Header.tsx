"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuthStore();
  const px = { fontFamily: '"Press Start 2P", cursive' } as const;

  // Don't show navbar on the home page if we want a clean splash screen
  if (pathname === "/") return null;

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "#fff",
        borderBottom: "4px solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 1000,
        ...px,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link
          href="/"
          style={{
            fontSize: "12px",
            color: "#000",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          PIXEL
        </Link>

        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            href="/community"
            style={{
              fontSize: "10px",
              color: pathname === "/community" ? "#a855f7" : "#000",
              textDecoration: "none",
            }}
          >
            COMMUNITY
          </Link>
          <Link
            href="/community/write"
            style={{
              fontSize: "10px",
              color: pathname === "/community/write" ? "#a855f7" : "#000",
              textDecoration: "none",
            }}
          >
            WRITE
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {isLoggedIn ? (
          <>
            <span style={{ fontSize: "10px", color: "#000" }}>
              {user?.username}님
            </span>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "10px",
                color: "#6b7280",
                padding: 0,
                textDecoration: "underline",
                fontFamily: "inherit",
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            style={{
              fontSize: "10px",
              color: "#000",
              textDecoration: "none",
              border: "2px solid #000",
              padding: "4px 8px",
              background: "#fff",
              boxShadow: "2px 2px 0px #000",
            }}
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
