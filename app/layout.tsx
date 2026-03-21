import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ReactNode } from "react";
import ReduxProvider from "@/providers/redux-provider";
import { useSdk } from "@/hooks/use-my-cookies";
import { cookies } from "next/headers";
import { User } from "@/types/user.type";
import { useRedirectServer } from "@/hooks/use-redirect-server";
import { getRedirectPath } from "@/helpers/misc.helper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONLEARN | Nền tảng học tập trực tuyến",
  description: "Nền tảng học tập trực tuyến dành cho sinh viên và giảng viên.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'dark';
  const sdk = await useSdk();

  let user: User | null = null;
  try {
    const response = await sdk.fetchMe();
    user = response.data;
  } catch (error) {
    console.log(error);
  }
  await useRedirectServer(user);



  return (
    <html lang="en" className={theme} style={{ colorScheme: theme }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider initialUser={user}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
