import type { NextApiRequest, NextApiResponse } from 'next';
import { getLeaderboard } from '../../lib/leaderboard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const leaderboard = await getLeaderboard();
    res.status(200).json(leaderboard);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}