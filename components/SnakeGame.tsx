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
  const [gameSize, setGameSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    const updateGameSize = () => {
      const width = Math.min(window.innerWidth - 20, 400);
      const height = Math.min(window.innerHeight - 200, 400);
      setGameSize({ width, height });
    };

    updateGameSize();
    window.addEventListener("resize", updateGameSize);
    return () => window.removeEventListener("resize", updateGameSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = Math.floor(gameSize.width / 20);
    const tileCount = {
      x: Math.floor(gameSize.width / gridSize),
      y: Math.floor(gameSize.height / gridSize),
    };

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
        head.x >= tileCount.x ||
        head.y < 0 ||
        head.y >= tileCount.y ||
        snake
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      );
    };

    const generateFood = () => {
      food.x = Math.floor(Math.random() * tileCount.x);
      food.y = Math.floor(Math.random() * tileCount.y);
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
      for (let i = 0; i <= tileCount.x; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i <= tileCount.y; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
      }
    };

    const handleGameOver = () => {
      setGameOver(true);
      updateLeaderboard();
      if (window.TelegramGameProxy) {
        window.TelegramGameProxy.setScore(score);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (dy === 0) {
            dx = 0;
            dy = -1;
          }
          break;
        case "ArrowDown":
          if (dy === 0) {
            dx = 0;
            dy = 1;
          }
          break;
        case "ArrowLeft":
          if (dx === 0) {
            dx = -1;
            dy = 0;
          }
          break;
        case "ArrowRight":
          if (dx === 0) {
            dx = 1;
            dy = 0;
          }
          break;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (Math.abs(x - centerX) > Math.abs(y - centerY)) {
        // Horizontal movement
        if (x > centerX && dx === 0) {
          dx = 1;
          dy = 0;
        } else if (x < centerX && dx === 0) {
          dx = -1;
          dy = 0;
        }
      } else {
        // Vertical movement
        if (y > centerY && dy === 0) {
          dx = 0;
          dy = 1;
        } else if (y < centerY && dy === 0) {
          dx = 0;
          dy = -1;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    canvas.addEventListener("touchstart", handleTouchStart);
    gameLoop();

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gameSize, score]);

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

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className={styles.gameContainer}>
      <canvas
        ref={canvasRef}
        width={gameSize.width}
        height={gameSize.height}
        className={styles.gameCanvas}
      />
      <div className={styles.scoreBoard}>Score: {score}</div>
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>Game Over!</h2>
          <button onClick={restartGame} className={styles.gameButton}>
            Play Again
          </button>
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
