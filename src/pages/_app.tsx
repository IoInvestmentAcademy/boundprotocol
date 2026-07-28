import "@/styles/globals.css";
import "@/bound protocol simlator/src/print.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
