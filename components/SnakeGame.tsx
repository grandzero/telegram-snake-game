import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/SnakeGame.module.css";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface LeaderboardEntry {
  userId: number;
  name: string;
  score: number;
}

interface SnakeGameProps {
  user: TelegramUser | null;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ user }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = 10;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;

    const gameLoop = () => {
      moveSnake();
      if (checkCollision()) {
        handleGameOver();
        return;
      }
      clearCanvas();
      drawFood();
      drawSnake();
      drawGrid();
      setTimeout(gameLoop, 100);
    };

    const moveSnake = () => {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setScore((prevScore) => prevScore + 1);
        generateFood();
      } else {
        snake.pop();
      }
    };

    const checkCollision = (): boolean => {
      const head = snake[0];
      return (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount ||
        snake
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      );
    };

    const generateFood = () => {
      food.x = Math.floor(Math.random() * tileCount);
      food.y = Math.floor(Math.random() * tileCount);
    };

    const clearCanvas = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawFood = () => {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    };

    const drawSnake = () => {
      ctx.fillStyle = "#0f0";
      snake.forEach((segment) => {
        ctx.fillRect(
          segment.x * gridSize,
          segment.y * gridSize,
          gridSize,
          gridSize
        );
      });
    };

    const drawGrid = () => {
      ctx.strokeStyle = "#030";
      for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
      }
    };

    const handleGameOver = () => {
      setGameOver(true);
      updateLeaderboard();
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          dx = 0;
          dy = -1;
          break;
        case "ArrowDown":
          dx = 0;
          dy = 1;
          break;
        case "ArrowLeft":
          dx = -1;
          dy = 0;
          break;
        case "ArrowRight":
          dx = 1;
          dy = 0;
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    gameLoop();

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const updateLeaderboard = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/updateLeaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, name: user.first_name, score }),
      });
      if (response.ok) {
        fetchLeaderboard();
      }
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const shareScore = () => {
    if (window.TelegramGameProxy) {
      // @ts-ignore
      window.TelegramGameProxy.shareScore();
    }
  };

  return (
    <div className={styles.gameContainer}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className={styles.gameCanvas}
      />
      <div className={styles.scoreBoard}>Score: {score}</div>
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>Game Over!</h2>
          <button onClick={shareScore}>Share Score</button>
        </div>
      )}
      <div className={styles.leaderboard}>
        <h3>Leaderboard</h3>
        <ul>
          {leaderboard.map((entry, index) => (
            <li key={index}>
              {entry.name}: {entry.score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SnakeGame;
