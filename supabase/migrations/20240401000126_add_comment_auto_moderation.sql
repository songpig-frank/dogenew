-- Add automatic comment moderation function

CREATE OR REPLACE FUNCTION auto_moderate_comment()
RETURNS TRIGGER AS $$
DECLARE
  has_links BOOLEAN;
  has_profanity BOOLEAN;
  profanity_word TEXT;
  profanity_list TEXT[] := ARRAY['badword1', 'badword2', 'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'cock', 'pussy', 'asshole'];
BEGIN
  -- Check for links
  has_links := NEW.content ~* 'https?://|www\\.';
  
  -- Check for profanity
  has_profanity := FALSE;
  FOREACH profanity_word IN ARRAY profanity_list LOOP
    IF NEW.content ~* ('\\m' || profanity_word || '\\M') THEN
      has_profanity := TRUE;
      EXIT;
    END IF;
  END LOOP;
  
  -- Auto-approve if no links or profanity
  IF NOT has_links AND NOT has_profanity THEN
    NEW.status := 'approved';
  ELSE
    -- Keep as pending for manual review
    NEW.status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS auto_moderate_comment_trigger ON comments;
CREATE TRIGGER auto_moderate_comment_trigger
BEFORE INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION auto_moderate_comment();

-- Update existing comments that are pending but don't have links or profanity
DO $$
DECLARE
  comment_record RECORD;
  has_links BOOLEAN;
  has_profanity BOOLEAN;
  profanity_word TEXT;
  profanity_list TEXT[] := ARRAY['badword1', 'badword2', 'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'cock', 'pussy', 'asshole'];
BEGIN
  FOR comment_record IN SELECT * FROM comments WHERE status = 'pending' LOOP
    -- Check for links
    has_links := comment_record.content ~* 'https?://|www\\.';
    
    -- Check for profanity
    has_profanity := FALSE;
    FOREACH profanity_word IN ARRAY profanity_list LOOP
      IF comment_record.content ~* ('\\m' || profanity_word || '\\M') THEN
        has_profanity := TRUE;
        EXIT;
      END IF;
    END LOOP;
    
    -- Auto-approve if no links or profanity
    IF NOT has_links AND NOT has_profanity THEN
      UPDATE comments SET status = 'approved' WHERE id = comment_record.id;
    END IF;
  END LOOP;
END;
$$;