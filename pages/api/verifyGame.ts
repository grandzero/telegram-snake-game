import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;
  const { id, user, score, inline_message_id } = query;

  // Recreate the data string
  const dataCheckString = Object.keys(query)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('\n');

  // Create a secret key
  const secret = crypto.createHash('sha256')
    .update(BOT_TOKEN || '')
    .digest();

  // Calculate the hash
  const hash = crypto.createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  if (hash === query.hash) {
    // The data is genuine
    res.status(200).json({ verified: true, user, score });
  } else {
    // The data is not genuine
    res.status(403).json({ verified: false });
  }
}