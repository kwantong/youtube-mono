"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { name: "Keyword", path: "/keyword" },
  { name: "Channel", path: "/channel" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/keyword");
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Sidebar */}
          <aside style={styles.sidebar}>
            <h2 style={styles.title}>User App</h2>
            <nav>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    style={{
                      ...styles.menuItem,
                      ...(isActive ? styles.menuItemActive : {}),
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main style={styles.content}>{children}</main>
        </div>
      </body>
    </html>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f3f4f6",
  },
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#1a202c",
    color: "#ffffff",
    padding: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  menuItem: {
    display: "block",
    padding: "10px 16px",
    textDecoration: "none",
    color: "white",
    borderRadius: "4px",
    transition: "background 0.2s",
  },
  menuItemActive: {
    backgroundColor: "#2d3748",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: "24px",
    backgroundColor: "#f9fafb",
  },
};
