import { useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import SnakeGame from "../components/SnakeGame";
import styles from "../styles/Home.module.css";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

declare global {
  interface Window {
    TelegramGameProxy?: {
      initParams: (params: string) => void;
      getUserData: () => Promise<TelegramUser>;
      setScore: (score: number) => void;
    };
  }
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  const initTelegram = () => {
    if (window.TelegramGameProxy) {
      window.TelegramGameProxy.initParams(window.location.search.slice(1));
      window.TelegramGameProxy.getUserData().then((data) => {
        setUser(data);
      });
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Retro Snake Game</title>
        <meta name="description" content="Retro Snake game for Telegram" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Script
        src="https://telegram.org/js/games.js"
        strategy="afterInteractive"
        onLoad={initTelegram}
      />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Retro Snake, {user ? user.first_name : "Player"}!
        </h1>

        <SnakeGame user={user} />
      </main>
    </div>
  );
}
