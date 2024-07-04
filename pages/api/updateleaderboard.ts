import type { NextApiRequest, NextApiResponse } from 'next';
import { updateLeaderboard } from '../../lib/leaderboard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { userId, name, score } = req.body;

    if (!userId || !name) {
      res.status(400).json({ error: 'Missing user information' });
      return;
    }

    await updateLeaderboard(userId, name, score);
    res.status(200).json({ message: 'Leaderboard updated successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}