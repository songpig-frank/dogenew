-- Delete all comments
DELETE FROM comment_votes;
DELETE FROM comments;

-- Reset comment counts on submissions
UPDATE submissions SET comments = 0;
