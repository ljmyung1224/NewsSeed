"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppState, LearningStats } from "@/types";
import { useAuth } from "@/features/auth/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { initialStats, loadState, mergeLearningStats, saveState } from "@/lib/storage";
import { loadCloudState, saveCloudState } from "@/services/user/userState";

export function useTreeState() {
  const { user, ready: authReady } = useAuth(isSupabaseConfigured());
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    if (!authReady) return;
    let active = true;
    void (async () => {
      const local = loadState(user?.id);
      const cloud = user ? await loadCloudState(user.id) : null;
      if (!active) return;
      const next = cloud ? { profile: local.profile ?? cloud.profile, stats: mergeLearningStats(local.stats, cloud.stats) } : local;
      setState(next);
      saveState(next, user?.id);
      if (user) void saveCloudState(user.id, next);
    })();
    return () => { active = false; };
  }, [authReady, user]);

  const updateStats = useCallback((update: (stats: LearningStats) => LearningStats) => {
    setState(current => {
      const base = current ?? { profile: null, stats: initialStats };
      const next = { ...base, stats: update(base.stats) };
      saveState(next, user?.id);
      if (user) void saveCloudState(user.id, next);
      return next;
    });
  }, [user]);

  return { state, updateStats, ready: authReady && state !== null };
}
