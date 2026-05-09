import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beneficio Familiar IUL",
  description:
    "Registro para beneficios familiares IUL.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
