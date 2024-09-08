import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "@/providers/query-provider";
import { SheetProvider } from "@/providers/sheet-provider";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/images/favicon.ico" sizes="any" />
        </head>
        <body>
          <Providers>
            <SheetProvider />
            <Toaster />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
