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
        existingEntry.name = name; // Update name in case it changed
      }
    } else {
      leaderboard.push({ userId, name, score });
    }
    
    // Sort leaderboard by score in descending order
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 scores
    leaderboard = leaderboard.slice(0, 10);
  }