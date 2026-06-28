'use client';

import { useCallback, useState } from 'react';

export function useChatMode(defaultGroupId = '929275476') {
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(defaultGroupId);

  const toggleMode = useCallback(() => {
    setIsGroupMode((prev) => !prev);
  }, []);

  const getModeParams = useCallback(() => {
    return {
      userType: isGroupMode ? 'group' : 'direct',
      groupId: isGroupMode ? groupId : null,
    };
  }, [isGroupMode, groupId]);

  return {
    isGroupMode,
    groupId,
    setGroupId,
    toggleMode,
    getModeParams,
  };
}
