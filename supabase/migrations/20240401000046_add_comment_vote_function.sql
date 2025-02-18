-- Create function to handle comment votes atomically
CREATE OR REPLACE FUNCTION handle_comment_vote(
  p_comment_id UUID,
  p_user_id UUID,
  p_vote_type TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_vote TEXT;
BEGIN
  -- Get current vote if exists
  SELECT vote_type INTO v_current_vote
  FROM comment_votes
  WHERE comment_id = p_comment_id AND user_id = p_user_id;
  
  -- If same vote exists, remove it
  IF v_current_vote = p_vote_type THEN
    DELETE FROM comment_votes
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
    
    -- Decrement the vote count
    IF p_vote_type = 'up' THEN
      UPDATE comments SET upvotes = GREATEST(0, upvotes - 1)
      WHERE id = p_comment_id;
    ELSE
      UPDATE comments SET downvotes = GREATEST(0, downvotes - 1)
      WHERE id = p_comment_id;
    END IF;
    
    RETURN NULL;
  
  -- If different vote exists, switch it
  ELSIF v_current_vote IS NOT NULL THEN
    UPDATE comment_votes
    SET vote_type = p_vote_type
    WHERE comment_id = p_comment_id AND user_id = p_user_id;
    
    -- Update both vote counts
    IF p_vote_type = 'up' THEN
      UPDATE comments SET 
        upvotes = upvotes + 1,
        downvotes = GREATEST(0, downvotes - 1)
      WHERE id = p_comment_id;
    ELSE
      UPDATE comments SET
        downvotes = downvotes + 1,
        upvotes = GREATEST(0, upvotes - 1)
      WHERE id = p_comment_id;
    END IF;
    
    RETURN p_vote_type;
  
  -- If no vote exists, create new one
  ELSE
    INSERT INTO comment_votes (comment_id, user_id, vote_type)
    VALUES (p_comment_id, p_user_id, p_vote_type);
    
    -- Increment the vote count
    IF p_vote_type = 'up' THEN
      UPDATE comments SET upvotes = upvotes + 1
      WHERE id = p_comment_id;
    ELSE
      UPDATE comments SET downvotes = downvotes + 1
      WHERE id = p_comment_id;
    END IF;
    
    RETURN p_vote_type;
  END IF;
END;
$$;