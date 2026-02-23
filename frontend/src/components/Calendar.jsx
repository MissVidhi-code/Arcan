import React, { useEffect, useState } from "react";

function Calendar(){
  const [events, setEvents] = useState(()=>{ try { return JSON.parse(localStorage.getItem('calendar_v1'))||[] } catch { return [] } });
  const [title,setTitle] = useState('');
  const [date,setDate] = useState('');
  const [notes,setNotes] = useState('');

  useEffect(()=>{ localStorage.setItem('calendar_v1', JSON.stringify(events)) },[events]);

  const addEvent = ()=>{
    if(!title||!date) return;
    const ev = { id: Date.now(), title, date, notes };
    setEvents(s=>[...s,ev]);
    setTitle(''); setDate(''); setNotes('');
  }

  const removeEvent = (id)=> setEvents(s=>s.filter(e=>e.id!==id));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-black to-purple-900 text-white px-4">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Calendar</h2>
        <p className="text-sm text-gray-400 mb-4">Save events and view them here. Events persist to localStorage.</p>

        {/* Input Section */}
        <div className="space-y-3 mb-4 bg-black/40 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none text-white placeholder-gray-400" 
              placeholder="Event title" 
              value={title} 
              onChange={(e)=>setTitle(e.target.value)} 
            />
            <input 
              className="w-48 px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none text-white" 
              style={{
                colorScheme: 'dark'
              }}
              type="date" 
              value={date} 
              onChange={(e)=>setDate(e.target.value)} 
            />
            <button 
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition" 
              onClick={addEvent}
            >
              Save
            </button>
          </div>
          <textarea 
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none text-white placeholder-gray-400" 
            placeholder="Notes (optional)" 
            value={notes} 
            onChange={(e)=>setNotes(e.target.value)} 
            rows={3} 
          />
        </div>

        {/* Events List */}
        <div className="h-80 overflow-y-auto space-y-3 p-4 bg-black/40 rounded-lg">
          {events.length===0 && <div className="text-gray-400 text-sm">No events yet.</div>}
          {events.map(ev=> (
            <div key={ev.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-sm text-gray-400">{ev.date}</div>
                </div>
                <button 
                  className="px-3 py-1 text-sm border border-white/10 rounded-lg hover:bg-white/10 transition" 
                  onClick={()=>removeEvent(ev.id)}
                >
                  Remove
                </button>
              </div>
              {ev.notes && <div className="mt-2 text-sm text-gray-300">{ev.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Calendar;
