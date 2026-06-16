-- Check total rows in each table
SELECT 'Users' as table_name, COUNT(*) as total_rows FROM User
UNION ALL
SELECT 'Game History', COUNT(*) FROM GameHistory
UNION ALL
SELECT 'Daily Rewards', COUNT(*) FROM DailyReward
UNION ALL
SELECT 'Achievements', COUNT(*) FROM Achievement;

-- Check database page count (approximate size)
SELECT * FROM pragma_page_count;
SELECT * FROM pragma_page_size;

-- Top users by game count
SELECT 
  u.username,
  u.email,
  COUNT(gh.id) as total_games,
  SUM(gh.betAmount) as total_wagered,
  u.coins as current_balance
FROM User u
LEFT JOIN GameHistory gh ON u.id = gh.userId
GROUP BY u.id
ORDER BY total_games DESC
LIMIT 10;
