-- Message Threading System for Contact Form

-- Message Threads table (conversations)
CREATE TABLE message_threads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (individual messages within threads)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table (for admin alerts)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  related_id INTEGER,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_message_threads_user_id ON message_threads(user_id);
CREATE INDEX idx_message_threads_status ON message_threads(status);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- Enable Row Level Security
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
