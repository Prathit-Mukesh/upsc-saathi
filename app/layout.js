import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { DataProvider } from "../lib/db";

export const metadata = {
  title: "UPSC Saathi — Personal Preparation Assistant",
  description: "Track your UPSC preparation: timetable, PYQ practice, answer writing, booklist & discipline tracker.",
  manifest: "/manifest.json",
  themeColor: "#b8860b",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
