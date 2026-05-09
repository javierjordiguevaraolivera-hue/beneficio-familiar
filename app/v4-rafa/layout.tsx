import type { ReactNode } from "react";

const metaPixelId = "1492754292286984";

export default function V4RafaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
if (window.location.pathname === '/v4-rafa' && !window.__v4RafaPageViewTracked) {
  window.__v4RafaPageViewTracked = true;
  window.__v4RafaMetaPixelId = '${metaPixelId}';
  fbq('init', '${metaPixelId}');
  fbq('track', 'PageView');
}
`,
          }}
        />
      </head>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {children}
    </>
  );
}
