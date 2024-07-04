interface LeaderboardEntry {
    userId: number;
    name: string;
    score: number;
  }
  
  let leaderboard: LeaderboardEntry[] = [];
  
  export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    return leaderboard;
  }
  
  export async function updateLeaderboard(userId: number, name: string, score: number): Promise<void> {
    const existingEntry = leaderboard.find(entry => entry.userId === userId);
    
    if (existingEntry) {
      if (score > existingEntry.score) {
        existingEntry.score = score;
      }
    } else {
      leaderboard.push({ userId, name, score });
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);  // Keep only top 10
  }