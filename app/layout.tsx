import type { Metadata } from "next";
import Script from "next/script";
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

const metaPixelId = "1492754292286984";
const ageRejectedCookieName = "bf_age_rejected";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          id="meta-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
var beneficioFamiliarRejected = document.cookie.split('; ').some(function(cookie) {
  return cookie === '${ageRejectedCookieName}=true';
});
if (!beneficioFamiliarRejected) {
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  window.__v4RafaPixelBootstrapped = true;
  window.__v4RafaMetaPixelId = '${metaPixelId}';
  fbq('init', '${metaPixelId}');
}
`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
