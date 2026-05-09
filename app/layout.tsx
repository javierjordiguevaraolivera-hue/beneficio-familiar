import type { Metadata } from "next";
import PixelScripts from "./pixel-scripts";
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
      <head>
        <PixelScripts />
      </head>
      <body>
        {children}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=826163019855530&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
