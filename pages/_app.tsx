import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useMediaPredicate } from 'react-media-hook';

import "../styles/markdown.css";
import "../styles/highlight.css";

function MyApp({ Component, pageProps }: AppProps) {
  // todo 检测浏览器主题
  const preferredTheme = useMediaPredicate("(prefers-color-scheme: dark)") ? "dark" : "light";

  return <Component {...pageProps} />;
}

export default MyApp;
