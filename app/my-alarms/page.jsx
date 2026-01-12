"use client";

import { useEffect, useMemo, useState } from "react";
import { FaBell } from "react-icons/fa";
import { onNativeMessage, sendToNative } from "../../lib/webviewBridge.js";

const STORAGE_KEY = "pc_my_alarms";

const defaultAlarms = [];

function isNativeApp() {
  return (
    typeof window !== "undefined" && typeof window.ReactNativeWebView !== "undefined"
  );
}

const askConfirmation = (message) => {
  if (typeof window === "undefined") return true;
  return window.confirm(message);
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateTime = (date) => {
  try {
    return `${date.toLocaleDateString("en-GB")}, ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } catch {
    return "";
  }
};

const formatRepeatLabel = (alarm) => {
  if (!alarm.repeat) return "Once";
  if (alarm.weekdays?.length) {
    const labels = alarm.weekdays
      .map((value) => WEEKDAY_LABELS[value] || value)
      .join(", ");
    return `Custom: ${labels}`;
  }
  return "Daily";
};

const computeCountdown = (date) => {
  const now = Date.now();
  const diff = date.getTime() - now;
  if (isNaN(diff)) return "Next at soon";

  if (diff <= 0) {
    return "Alarm time passed";
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m until alarm`;
  }
  return `${minutes}m until alarm`;
};

const mapNativeAlarm = (alarm) => {
  const parsedDate = alarm.alarmTime ? new Date(alarm.alarmTime) : new Date();
  if (isNaN(parsedDate.getTime())) return null;
  return {
    id: alarm.id ?? alarm.alarmId ?? Date.now(),
    title: alarm.title || alarm.trackTitle || "Alarm",
    datetime: formatDateTime(parsedDate),
    repeat: formatRepeatLabel(alarm),
    countdown: computeCountdown(parsedDate),
    snooze: `${alarm.snoozeMinutes ?? 5} min`,
    vibration: alarm.vibrationEnabled ? "On" : "Off",
    raw: alarm,
  };
};

const createAlarmEntry = (overrides = {}) => ({
  id: Date.now(),
  title: overrides.title || "New Alarm",
  datetime:
    overrides.datetime ||
    `${new Date().toLocaleDateString("en-GB")}, ${overrides.time ?? "07:00 AM"}`,
  repeat: overrides.repeat || "Custom",
  countdown: overrides.countdown || `Next at ${overrides.time || "07:00 AM"}`,
  snooze: overrides.snooze || "5 min",
  vibration: overrides.vibration || "On",
});

export default function MyAlarmsPage() {
  const [alarms, setAlarms] = useState([]);
  const [cancelledAlarms, setCancelledAlarms] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    console.log("MyAlarmsPage: stored payload", saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
    console.log("MyAlarmsPage: parsed payload", parsed);
        setAlarms(parsed.active || []);
        setCancelledAlarms(parsed.cancelled || []);
        return;
      } catch (error) {
        console.error("Failed to parse saved alarms", error);
      }
    }
    console.log("MyAlarmsPage: no stored alarms, waiting for native sync");
  }, []);

  useEffect(() => {
    if (!isNativeApp()) return;
    const cleanup = onNativeMessage((payload) => {
      if (payload?.type !== "NATIVE_ALARMS") return;
      const nativeAlarms = Array.isArray(payload.alarms) ? payload.alarms : [];
      const mapped = nativeAlarms
        .map(mapNativeAlarm)
        .filter((alarm) => alarm !== null);
      if (mapped.length) {
        setAlarms(mapped);
        setCancelledAlarms([]);
      }
    });
    sendToNative({ type: "REQUEST_NATIVE_ALARMS" });
    return cleanup;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ active: alarms, cancelled: cancelledAlarms })
    );
  }, [alarms, cancelledAlarms]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("MyAlarmsPage: current active alarms", alarms);
    console.log("MyAlarmsPage: current cancelled alarms", cancelledAlarms);
  }, [alarms, cancelledAlarms]);

  const handleAddAlarm = () => {
    if (!isNativeApp()) return;
    sendToNative({ type: "OPEN_ALARMS" });
  };

  const handleCancel = (alarm) => {
    if (!askConfirmation(`Cancel alarm "${alarm.title}"?`)) return;
    setAlarms((prev) => prev.filter((item) => item.id !== alarm.id));
    setCancelledAlarms((prev) => [alarm, ...prev]);
    if (isNativeApp()) {
      const nativeId = alarm.raw?.alarmId ?? alarm.id;
      sendToNative({ type: "CANCEL_ALARM", alarmId: nativeId });
    }
  };

  const handleActivate = (alarm) => {
    setCancelledAlarms((prev) => prev.filter((item) => item.id !== alarm.id));
    setAlarms((prev) => [alarm, ...prev]);
  };

  const handleDelete = (alarm) => {
    if (!askConfirmation(`Delete alarm "${alarm.title}" permanently?`)) return;
    setAlarms((prev) => prev.filter((item) => item.id !== alarm.id));
    setCancelledAlarms((prev) => prev.filter((item) => item.id !== alarm.id));
    if (isNativeApp()) {
      const nativeId = alarm.raw?.alarmId ?? alarm.id;
      sendToNative({ type: "DELETE_ALARM", alarmId: nativeId });
    }
  };

  const handleCancelAll = () => {
    if (!askConfirmation("Cancel all alarms?")) return;
    setCancelledAlarms((prev) => [...alarms, ...prev]);
    setAlarms([]);
  };

  const activeCount = alarms.length;

  const hasAlarms = useMemo(() => activeCount > 0, [activeCount]);

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Alarm center</p>
            <h1 className="text-3xl font-bold text-slate-900">My Alarms</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancelAll}
              className="rounded-full border border-rose-300 px-4 py-2 text-sm text-rose-500"
            >
              Cancel All
            </button>
            <button
              onClick={handleAddAlarm}
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow"
            >
              <FaBell />
              + Add Alarm
            </button>
          </div>
        </header>

        <section className="space-y-4">
          {hasAlarms ? (
            alarms.map((alarm) => (
              <article
                key={alarm.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{alarm.title}</h2>
                    <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{alarm.datetime}</p>
                    <p className="mt-2 text-sm text-slate-500">{alarm.repeat}</p>
                    <p className="text-sm text-emerald-500">{alarm.countdown}</p>
                    <p className="text-xs text-slate-500">
                      Snooze: {alarm.snooze} · Vibration: {alarm.vibration}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCancel(alarm)}
                      className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(alarm)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No scheduled alarms yet. Tap + Add Alarm or choose a preset to get started.
            </div>
          )}
        </section>

        {cancelledAlarms.length > 0 && (
          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Cancelled</p>
              <p className="text-sm text-slate-500">These alarms were cancelled but can be reactivated.</p>
            </div>
            {cancelledAlarms.map((alarm) => (
              <article
                key={`cancelled-${alarm.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{alarm.title}</h2>
                    <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{alarm.datetime}</p>
                    <p className="mt-2 text-sm text-slate-500">{alarm.repeat}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActivate(alarm)}
                      className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-500"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleDelete(alarm)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}