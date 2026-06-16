-- CLEANUP SCRIPT - Run this to clean old data

-- 1. Delete game history older than 30 days
DELETE FROM GameHistory 
WHERE createdAt < datetime('now', '-30 days');

-- 2. Delete inactive users (no login in 90 days, 0 coins)
DELETE FROM User 
WHERE lastLogin < datetime('now', '-90 days') 
  AND coins = 0 
  AND role = 'USER';

-- 3. Delete achievements for deleted users (orphaned records)
DELETE FROM Achievement 
WHERE userId NOT IN (SELECT id FROM User);

-- 4. Delete daily rewards for deleted users (orphaned records)
DELETE FROM DailyReward 
WHERE userId NOT IN (SELECT id FROM User);

-- Check results after cleanup
SELECT 'Users' as table_name, COUNT(*) as remaining_rows FROM User
UNION ALL
SELECT 'Game History', COUNT(*) FROM GameHistory
UNION ALL
SELECT 'Daily Rewards', COUNT(*) FROM DailyReward
UNION ALL
SELECT 'Achievements', COUNT(*) FROM Achievement;
