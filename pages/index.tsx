import { useEffect, useState } from "react";
import Head from "next/head";
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
    };
  }
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const initTelegram = () => {
      if (window.TelegramGameProxy) {
        window.TelegramGameProxy.initParams(window.location.search.slice(1));
        window.TelegramGameProxy.getUserData().then((data) => {
          setUser(data);
        });
      }
    };

    if (document.readyState === "complete") {
      initTelegram();
    } else {
      window.addEventListener("load", initTelegram);
      return () => window.removeEventListener("load", initTelegram);
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Telegram Snake Game</title>
        <meta name="description" content="Snake game for Telegram" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://telegram.org/js/games.js"></script>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Snake Game, {user ? user.first_name : "Player"}!
        </h1>

        <SnakeGame user={user} />
      </main>
    </div>
  );
}
