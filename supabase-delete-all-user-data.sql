-- =====================================================
-- DELETE ALL USER DATA FUNCTION
-- =====================================================
-- This function deletes ALL data for a specific user
-- Usage: SELECT delete_all_user_data('user-id-here');
-- =====================================================

CREATE OR REPLACE FUNCTION delete_all_user_data(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  deleted_sessions_count INTEGER;
  deleted_tasks_count INTEGER;
  deleted_settings_count INTEGER;
  result JSON;
BEGIN
  -- Delete all sessions for this user
  DELETE FROM sessions WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_sessions_count = ROW_COUNT;
  
  -- Delete all tasks for this user (will cascade to sessions if FK is set)
  DELETE FROM tasks WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_tasks_count = ROW_COUNT;
  
  -- Delete settings for this user (if exists)
  DELETE FROM settings WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_settings_count = ROW_COUNT;
  
  -- Return result as JSON
  result := json_build_object(
    'success', true,
    'deleted_sessions', deleted_sessions_count,
    'deleted_tasks', deleted_tasks_count,
    'deleted_settings', deleted_settings_count,
    'message', 'All user data deleted successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to delete user data'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant execute permission to authenticated users
-- =====================================================
GRANT EXECUTE ON FUNCTION delete_all_user_data(UUID) TO authenticated;

-- =====================================================
-- Test the function (uncomment to test with your user_id)
-- =====================================================
-- SELECT delete_all_user_data('your-user-id-here');

-- =====================================================
-- To drop the function later if needed:
-- =====================================================
-- DROP FUNCTION IF EXISTS delete_all_user_data(UUID);
