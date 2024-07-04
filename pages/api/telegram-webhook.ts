import type { NextApiRequest, NextApiResponse } from 'next';
import TelegramBot from 'node-telegram-bot-api';
import { getLeaderboard } from '../../lib/leaderboard';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: false });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message } = req.body;
    
    if (message?.text) {
      const chatId = message.chat.id;

      switch (message.text) {
        case '/start':
          await bot.sendMessage(chatId, 'Welcome to Snake Game! Click here to play: [Play Snake](your_game_url_here)', { parse_mode: 'Markdown' });
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
          await bot.sendMessage(chatId, 'Unknown command. Try /start or /leaderboard');
      }
    }

    res.status(200).json({ message: 'OK' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}