import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Profile } from '../types/profile.types';
import { DEFAULT_PROFILE, getProfile, profileIsOffline, subscribeProfile } from '../Services/profileService';
import { queryClient, queryKeys } from '@/services/api/queryClient';

function loadProfile(): Promise<Profile> {
  return getProfile();
}

export function useProfileSnapshot() {
  const query = useQuery({ queryKey: queryKeys.profile, queryFn: loadProfile, initialData: DEFAULT_PROFILE, initialDataUpdatedAt: 0 });
  useEffect(() => subscribeProfile((profile) => {
    queryClient.setQueryData(queryKeys.profile, profile);
  }), []);
  return {
    profile: query.data,
    loading: query.isLoading,
    refreshing: query.isFetching,
    offline: profileIsOffline(),
    error: query.error instanceof Error ? query.error : null,
    refresh: query.refetch,
  };
}
