import React, { useEffect, useState } from "react";

function Reminder() {
  const [reminder, setReminder] = useState("");
  const [time, setTime] = useState("12:00");
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reminders_v1")) || [] } catch { return [] }
  });
  const [notified, setNotified] = useState(new Set());

  useEffect(() => {
    localStorage.setItem("reminders_v1", JSON.stringify(list));
  }, [list]);

  // Check for reminders that match current time and trigger notification
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      list.forEach((r) => {
        if (r.time === currentTime && !r.done && !notified.has(r.id)) {
          // Trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Reminder!', { body: r.text, tag: r.id });
          } else {
            alert(`⏰ Reminder: ${r.text}`);
          }
          setNotified((s) => new Set([...s, r.id]));
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [list, notified]);

  const addReminder = () => {
    if (reminder.trim() === "") return;
    const newReminder = { id: Date.now(), text: reminder.trim(), time, done: false };
    setList((s) => [...s, newReminder]);
    setReminder("");
    setTime("12:00");
  };

  const removeReminder = (id) => setList((s) => s.filter((r) => r.id !== id));

  const toggleDone = (id) => setList((s) => s.map((r) => r.id === id ? { ...r, done: !r.done } : r));

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const animatedBgStyle = `
    @keyframes dotGlowMove { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, 10px); } 100% { transform: translate(0, 0); } }
    @keyframes glowPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    .dotted-glow { position: relative; background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1), transparent 50%); }
    .dot-pattern { position: absolute; width: 100%; height: 100%; pointer-events: none; opacity: 0.15; animation: dotGlowMove 8s ease-in-out infinite; }
    .dot-pattern::before { content: ''; position: absolute; width: 100%; height: 100%; background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 25px 25px; animation: glowPulse 3s ease-in-out infinite; }
  `;

  return (
    <>
      <style>{animatedBgStyle}</style>
      <div className="min-h-screen flex items-center justify-center px-4 dotted-glow relative overflow-hidden">
        <div className="dot-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto py-8 px-4 z-10">
      <div className="bg-white/5 border border-white/6 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold mb-2">Reminders</h2>
        <p className="text-sm text-gray-300 mb-4">Set a time and get reminded. Notifications trigger at the exact time.</p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            placeholder="Reminder text..."
          />
          <input
            className="w-32 bg-transparent border border-white/10 rounded px-3 py-2"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button
            onClick={addReminder}
            className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Add
          </button>
        </div>

        <ul className="mt-6 space-y-3">
          {list.length === 0 && <li className="text-sm text-gray-300">No reminders yet.</li>}
          {list.map((r) => (
            <li
              key={r.id}
              className={`flex items-center justify-between p-3 rounded ${r.done ? 'bg-green-900/20 border border-green-500/30' : 'bg-white/3'}`}
            >
              <div className="flex-1">
                <div className={`text-sm ${r.done ? 'line-through text-gray-400' : ''}`}>{r.text}</div>
                <div className="text-xs text-gray-400 mt-1">⏰ {r.time}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-2 py-1 text-xs rounded border ${r.done ? 'border-green-500 bg-green-900/30' : 'border-white/10'}`}
                  onClick={() => toggleDone(r.id)}
                >
                  {r.done ? '✓ Done' : 'Mark'}
                </button>
                <button
                  className="px-2 py-1 text-xs border rounded"
                  onClick={() => removeReminder(r.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
    </>
  );
}

export default Reminder;
