import React, { useEffect, useState } from "react";

function Timetable() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tasks_v1")) || [];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [type, setType] = useState("flexible");
  const [priority, setPriority] = useState("high");
  const [duration, setDuration] = useState(1);
  const [start, setStart] = useState(9);
  const [end, setEnd] = useState(10);
  const [schedule, setSchedule] = useState(() => {
    try { return JSON.parse(localStorage.getItem("timetable_v1")) || Array(24).fill(null); } catch { return Array(24).fill(null); }
  });
  const [minCycles, setMinCycles] = useState(4);
  const [autoSleepInsert, setAutoSleepInsert] = useState(true);
  const [sleepInserted, setSleepInserted] = useState(false);
  const [nightStart, setNightStart] = useState(22);
  const [nightEnd, setNightEnd] = useState(7);
  const [lastInsertInfo, setLastInsertInfo] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks_v1", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("timetable_v1", JSON.stringify(schedule));
  }, [schedule]);

  const addTask = () => {
    if (!title.trim()) return;
    const id = Date.now();
    const t = { id, title, type, priority, duration: Number(duration), start: Number(start), end: Number(end) };
    setTasks((s) => [...s, t]);
    setTitle("");
  };

  const removeTask = (id) => setTasks((s) => s.filter((t) => t.id !== id));

  const resetSchedule = () => { setSchedule(Array(24).fill(null)); setSleepInserted(false); };

  function generateSchedule() {
    // Simple heuristic scheduler: place fixed tasks, then flexible by priority
    const slots = Array(24).fill(null);

    // place fixed tasks
    const fixed = tasks.filter((t) => t.type === "fixed");
    fixed.forEach((t) => {
      for (let h = t.start; h < t.end && h < 24; h++) {
        slots[h] = { title: t.title, type: "fixed", priority: t.priority };
      }
    });

    // flexible tasks sorted by priority high->med->low
    const prioOrder = { high: 0, medium: 1, low: 2 };
    const flexible = tasks.filter((t) => t.type === "flexible").sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority]);

    flexible.forEach((t) => {
      let remaining = t.duration;
      // find consecutive free block >= duration
      let placed = false;
      for (let i = 0; i <= 24 - remaining; i++) {
        let ok = true;
        for (let j = 0; j < remaining; j++) {
          if (slots[i + j]) { ok = false; break; }
        }
        if (ok) {
          for (let j = 0; j < remaining; j++) slots[i + j] = { title: t.title, type: "flex", priority: t.priority };
          placed = true; break;
        }
      }
      if (!placed) {
        // fill earliest free slots (non-consecutive)
        for (let h = 0; h < 24 && remaining > 0; h++) {
          if (!slots[h]) { slots[h] = { title: t.title, type: "flex", priority: t.priority }; remaining--; }
        }
      }
    });

    // optionally insert sleep to satisfy minimum cycles
    if (autoSleepInsert) {
      const res = insertSleepIfNeeded(slots, minCycles);
      setSchedule(res);
      computeSleepStats(res);
    } else {
      setSchedule(slots);
      computeSleepStats(slots);
    }
  }

  // Insert sleep blocks (hours) to satisfy minCycles (each cycle = 1.5h)
  function insertSleepIfNeeded(slotsIn, cycles) {
    const slots = slotsIn.slice();
    const requiredHours = Math.ceil(cycles * 1.5);
    let remaining = requiredHours;
    console.log('[Sleep] requested cycles:', cycles, 'requiredHours:', requiredHours);

    // helper to build index arrays for night window (handles wrap)
    const getNightIndices = (start, end) => {
      const idx = [];
      if (start < end) {
        for (let h = start; h < end; h++) idx.push(h);
      } else {
        for (let h = start; h < 24; h++) idx.push(h);
        for (let h = 0; h < end; h++) idx.push(h);
      }
      return idx;
    };

    const nightIdx = getNightIndices(nightStart, nightEnd);
    console.log('[Sleep] night indices:', nightIdx);
    const allIdx = Array.from({ length: 24 }, (_, i) => i);
    const otherIdx = allIdx.filter((i) => !nightIdx.includes(i));

    // 1) Fill free hours in night window
    for (const h of nightIdx) {
      if (remaining <= 0) break;
      if (!slots[h]) { slots[h] = { title: 'Sleep', type: 'sleep' }; remaining--; }
    }
    console.log('[Sleep] after filling free night hours, remaining:', remaining);

    // 2) Evict low-priority flexible hours in night window if needed (low->medium->high)
    const prios = ['low', 'medium', 'high'];
    for (const p of prios) {
      if (remaining <= 0) break;
      for (const h of nightIdx) {
        if (remaining <= 0) break;
        const s = slots[h];
        if (s && s.type === 'flex' && s.priority === p) {
          slots[h] = { title: 'Sleep', type: 'sleep' };
          remaining--;
        }
      }
    }
    console.log('[Sleep] after evicting night flex, remaining:', remaining);

    // 3) If still needed, fill free hours outside night window
    for (const h of otherIdx) {
      if (remaining <= 0) break;
      if (!slots[h]) { slots[h] = { title: 'Sleep', type: 'sleep' }; remaining--; }
    }
    console.log('[Sleep] after filling free other hours, remaining:', remaining);

    // 4) Evict low-priority flexible hours outside night window
    for (const p of prios) {
      if (remaining <= 0) break;
      for (const h of otherIdx) {
        if (remaining <= 0) break;
        const s = slots[h];
        if (s && s.type === 'flex' && s.priority === p) {
          slots[h] = { title: 'Sleep', type: 'sleep' };
          remaining--;
        }
      }
    }

    console.log('[Sleep] after evicting other flex, remaining:', remaining);

    const anySleep = slots.some((s) => s && s.type === 'sleep');
    setSleepInserted(anySleep);
    console.log('[Sleep] anySleep:', anySleep);
    setLastInsertInfo({ requiredHours, remaining, anySleep });
    return slots;
  }

  // Sleep calculator: finds contiguous free blocks and computes how many 90-min sleep cycles fit
  const [sleepStats, setSleepStats] = useState({ maxContiguousCycles: 0, totalCycles: 0, blocks: [] });

  function computeSleepStats(slots) {
    const freeBlocks = [];
    let cur = 0;
    for (let h = 0; h <= 24; h++) {
      if (h < 24 && !slots[h]) { cur++; }
      else {
        if (cur > 0) { freeBlocks.push(cur); }
        cur = 0;
      }
    }
    // each cycle = 1.5 hours
    const cyclesPerBlock = freeBlocks.map((hours) => Math.floor((hours * 60) / 90));
    const totalCycles = cyclesPerBlock.reduce((a, b) => a + b, 0);
    const maxContiguousCycles = cyclesPerBlock.length ? Math.max(...cyclesPerBlock) : 0;
    const blocks = freeBlocks.map((hrs, i) => ({ hours: hrs, cycles: cyclesPerBlock[i] }));
    setSleepStats({ maxContiguousCycles, totalCycles, blocks });
  }

  useEffect(() => {
    computeSleepStats(schedule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

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
      <div className="min-h-screen dotted-glow relative overflow-hidden">
        <div className="dot-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto py-8 px-4 z-10 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/6 rounded-lg p-5 shadow">
          <h2 className="text-lg font-semibold mb-3">Create Task</h2>
          <input className="w-full mb-3 bg-transparent border border-white/10 rounded px-3 py-2" placeholder="Task title" value={title} onChange={(e)=>setTitle(e.target.value)} />

          <div className="flex gap-3 mb-3">
            <select className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}>
              <option value="fixed">Fixed Slot</option>
              <option value="flexible">Flexible Slot</option>
            </select>
            <select className="w-36 bg-transparent border border-white/10 rounded px-3 py-2" value={priority} onChange={(e)=>setPriority(e.target.value)}>
              <option value="high">Most Important</option>
              <option value="medium">Important</option>
              <option value="low">Can Wait</option>
            </select>
          </div>

          {type === "fixed" ? (
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-300">Start</label>
                <input className="w-full bg-transparent border border-white/10 rounded px-3 py-2" type="number" min={0} max={23} value={start} onChange={(e)=>setStart(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-300">End</label>
                <input className="w-full bg-transparent border border-white/10 rounded px-3 py-2" type="number" min={1} max={24} value={end} onChange={(e)=>setEnd(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <label className="block text-sm text-gray-300">Duration (hours)</label>
              <input className="w-40 bg-transparent border border-white/10 rounded px-3 py-2" type="number" min={1} max={8} value={duration} onChange={(e)=>setDuration(e.target.value)} />
            </div>
          )}

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white" onClick={addTask}>Add Task</button>
            <button className="px-4 py-2 rounded border border-white/10 text-sm" onClick={()=>{setTasks([]); resetSchedule();}}>Clear All</button>
          </div>

          <div className="mt-4 space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-white/3 p-3 rounded">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-gray-300">{t.type} {t.type==='fixed' ? `(${t.start}:00-${t.end}:00)` : `(${t.duration}h)`}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.priority==='high'?'bg-amber-300 text-amber-900':t.priority==='medium'?'bg-amber-500 text-white':'bg-sky-300 text-sky-900'}`}>{t.priority}</span>
                  <button className="px-3 py-1 text-sm border rounded" onClick={()=>removeTask(t.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/6 rounded-lg p-5 shadow">
          <h2 className="text-lg font-semibold mb-2">Auto-generate Timetable</h2>
          <p className="text-sm text-gray-300 mb-3">Let the scheduler allocate flexible tasks into free slots, prioritizing important tasks.</p>
          <div className="flex gap-3 mb-2 items-center">
            <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white" onClick={generateSchedule}>Generate</button>
            <button className="px-4 py-2 rounded border" onClick={resetSchedule}>Reset</button>
            <label className="ml-3 flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={autoSleepInsert} onChange={(e)=>setAutoSleepInsert(e.target.checked)} className="accent-indigo-500" /> Auto-insert Sleep
            </label>
            <label className="ml-2 text-sm text-gray-300">Min cycles:
              <input type="number" min={1} max={8} value={minCycles} onChange={(e)=>setMinCycles(Number(e.target.value))} className="ml-2 w-16 bg-transparent border border-white/10 rounded px-2 py-1" />
            </label>
          </div>
          <div className="mb-4">
            <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-full md:w-auto" onClick={()=>{ const res = insertSleepIfNeeded(schedule, minCycles); setSchedule(res); computeSleepStats(res); }} title="Force insert sleep into timetable">Force Insert Sleep</button>
          </div>

          <div className="mb-4 p-3 bg-black/5 rounded">
            <h4 className="text-sm font-medium mb-2">Sleep Calculator</h4>
            <div className="text-sm text-gray-300">
              <div>Max contiguous sleep cycles (90m): <span className="font-semibold text-white">{sleepStats.maxContiguousCycles}</span></div>
              <div>Total possible cycles across day: <span className="font-semibold text-white">{sleepStats.totalCycles}</span></div>
              <div className="mt-2 text-xs text-gray-400">Blocks: {sleepStats.blocks.length === 0 ? 'None' : sleepStats.blocks.map((b, i) => `${b.hours}h→${b.cycles}c`).join(', ')}</div>
              <div className="mt-2 text-xs text-gray-400">Recommendation: Aim for at least <span className="font-semibold">4 cycles (≈6h)</span> if possible.</div>
              {lastInsertInfo && (
                <div className="mt-2 text-xs text-gray-400">Last insert attempt: required <span className="font-semibold">{lastInsertInfo.requiredHours}h</span>, remaining <span className="font-semibold">{lastInsertInfo.remaining}h</span>, inserted: <span className="font-semibold">{String(lastInsertInfo.anySleep)}</span></div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed bg-transparent text-sm">
              <thead>
                <tr className="text-left text-gray-300">
                  <th className="w-36 px-2 py-2">Time</th>
                  <th className="px-2 py-2">Task</th>
                </tr>
              </thead>
              <tbody>
                {hours.map((h) => (
                  <tr key={h} className="border-t border-white/6">
                    <td className="px-2 py-3 text-gray-200">{h}:00 - {h+1}:00</td>
                    <td className="px-2 py-3">
                      {schedule[h] ? (
                        schedule[h].type === 'fixed' ? (
                          <span className={`inline-block px-3 py-1 rounded bg-amber-100 text-amber-900`}>{schedule[h].title} {schedule[h].priority ? `(${schedule[h].priority})` : ''}</span>
                        ) : schedule[h].type === 'sleep' ? (
                          <span className={`inline-block px-3 py-1 rounded bg-sky-100 text-sky-900 italic`}>{schedule[h].title}</span>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded bg-green-100 text-green-900`}>{schedule[h].title} {schedule[h].priority ? `(${schedule[h].priority})` : ''}</span>
                        )
                      ) : (
                        <span className="text-gray-400">Free</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}

export default Timetable;
