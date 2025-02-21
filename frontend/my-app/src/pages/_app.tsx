import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import AppShell from "../components/layouts/AppShell";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </SessionProvider>
  );
}
