-- Chat history table to store all chat interactions
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  response_source TEXT DEFAULT 'rule',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Chat feedback table to track user feedback on chatbot responses
CREATE TABLE IF NOT EXISTS chat_feedback (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES chat_history(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot training data table for storing custom training examples
CREATE TABLE IF NOT EXISTS chatbot_training (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_by TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Function to get common chat queries (for analytics)
CREATE OR REPLACE FUNCTION get_common_chat_queries()
RETURNS TABLE (
  query TEXT,
  count BIGINT
) LANGUAGE SQL AS $$
  SELECT message as query, COUNT(*) as count
  FROM chat_history
  GROUP BY message
  ORDER BY count DESC
  LIMIT 20;
$$;

-- Function to get response source distribution (for analytics)
CREATE OR REPLACE FUNCTION get_response_source_distribution()
RETURNS TABLE (
  source TEXT,
  count BIGINT,
  percentage NUMERIC
) LANGUAGE SQL AS $$
  WITH total AS (
    SELECT COUNT(*) as total_count FROM chat_history
  )
  SELECT 
    response_source as source, 
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / total.total_count), 2) as percentage
  FROM chat_history, total
  GROUP BY response_source, total.total_count
  ORDER BY count DESC;
$$;

-- Index for faster querying
CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS chat_history_timestamp_idx ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS chat_feedback_message_id_idx ON chat_feedback(message_id);
