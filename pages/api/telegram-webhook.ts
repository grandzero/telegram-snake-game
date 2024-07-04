import type { NextApiRequest, NextApiResponse } from 'next';
import TelegramBot from 'node-telegram-bot-api';
import { getLeaderboard } from '../../lib/leaderboard';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: false });

// Replace 'your_game_short_name' with the short name you set for your game in BotFather
const GAME_SHORT_NAME = 'snake_telegram';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message, callback_query } = req.body;
    
    if (message?.text) {
      const chatId = message.chat.id;

      switch (message.text) {
        case '/start':
          await bot.sendGame(chatId, GAME_SHORT_NAME);
          break;
        case '/leaderboard':
          const leaderboard = await getLeaderboard();
          let leaderboardText = 'Top 10 Players:\n';
          leaderboard.forEach((entry, index) => {
            leaderboardText += `${index + 1}. ${entry.name}: ${entry.score}\n`;
          });
          if (leaderboardText === 'Top 10 Players:\n') {
            leaderboardText += 'No scores yet. Be the first to play!';
          }
          await bot.sendMessage(chatId, leaderboardText);
          break;
        default:
          await bot.sendMessage(chatId, 'Unknown command. Try /start to play the game or /leaderboard to see top scores.');
      }
    } else if (callback_query) {
      // Handle game callback query
      if (callback_query.game_short_name === GAME_SHORT_NAME) {
        await bot.answerCallbackQuery(callback_query.id, {
          url: process.env.VERCEL_URL, // Make sure to set this environment variable in your Vercel project
        });
      }
    }

    res.status(200).json({ message: 'OK' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}