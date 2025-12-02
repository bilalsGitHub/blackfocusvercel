-- Fix cascade delete for sessions when task is deleted
-- This ensures that when a task is deleted, all associated sessions are also deleted
-- instead of having their task_id set to NULL

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE sessions 
DROP CONSTRAINT IF EXISTS sessions_task_id_fkey;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE sessions
ADD CONSTRAINT sessions_task_id_fkey 
FOREIGN KEY (task_id) 
REFERENCES tasks(id) 
ON DELETE CASCADE;

-- Explanation:
-- ON DELETE CASCADE means: When a task is deleted, automatically delete all sessions linked to it
-- This prevents orphaned sessions with null task_id from appearing as "unassigned"
