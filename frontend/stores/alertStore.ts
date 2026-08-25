"use client";

import { create } from "zustand";
import { Alert } from "@/lib/types";
import { getAlerts, markAlertAsRead } from "@/lib/api/alerts";

interface AlertStore {
  alerts: Alert[];
  isLoading: boolean;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  isLoading: false,
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => {
      // Avoid duplicate alert by ID
      if (state.alerts.some((a) => a.id === alert.id)) {
        return state;
      }
      return { alerts: [alert, ...state.alerts] };
    }),
  markAsRead: (id) => {
    // Optimistic update: reflect the change on screen immediately...
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, is_read: true } : a,
      ),
    }));
    // ...then persist it to the backend so a page refresh doesn't revert it.
    markAlertAsRead(id);
  },
  markAllAsRead: () => {
    const unreadIds = get()
      .alerts.filter((a) => !a.is_read)
      .map((a) => a.id);

    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, is_read: true })),
    }));

    // Persist each one to the backend. There's no bulk "mark all read"
    // endpoint, so we fire a request per previously-unread alert.
    unreadIds.forEach((id) => {
      markAlertAsRead(id);
    });
  },
  fetchAlerts: async () => {
    set({ isLoading: true });
    try {
      const data = await getAlerts();
      set({ alerts: data });
    } catch (error) {
      console.error("Failed to fetch alerts in store:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
