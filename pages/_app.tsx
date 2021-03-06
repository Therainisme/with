import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { useMediaPredicate } from 'react-media-hook';

import "../styles/markdown/markdown.css";
import "../styles/markdown/highlight.css";

function MyApp({ Component, pageProps }: AppProps) {
  // todo 检测浏览器主题
  const preferredTheme = useMediaPredicate("(prefers-color-scheme: dark)") ? "dark" : "light";

  return <Component {...pageProps} />;
}

export default MyApp;
