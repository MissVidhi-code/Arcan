import React, { useEffect, useState } from "react";

function Notes() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("notes_v1")) || [] } catch { return [] }
  });
  const [pdfs, setPdfs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pdfs_v1")) || [] } catch { return [] }
  });

  useEffect(() => {
    localStorage.setItem("notes_v1", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("pdfs_v1", JSON.stringify(pdfs));
  }, [pdfs]);

  const addNote = () => {
    if (note.trim() === "") return;
    setNotes((s) => [...s, { id: Date.now(), text: note.trim() }]);
    setNote("");
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfs((s) => [...s, { id: Date.now(), name: file.name, data: event.target.result }]);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const removePdf = (id) => {
    setPdfs((s) => s.filter((p) => p.id !== id));
  };

  const animatedBgStyle = `
    @keyframes dotGlowMove { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, 10px); } 100% { transform: translate(0, 0); } }
    @keyframes glowPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    .dotted-glow { background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(0, 0, 0, 0.5), rgba(168, 85, 247, 0.1)); }
    .dot-pattern { position: absolute; width: 100%; height: 100%; pointer-events: none; opacity: 0.15; animation: dotGlowMove 8s ease-in-out infinite; }
    .dot-pattern::before { content: ''; position: absolute; width: 100%; height: 100%; background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 25px 25px; animation: glowPulse 3s ease-in-out infinite; }
  `;

  return (
    <>
      <style>{animatedBgStyle}</style>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-black to-purple-900 text-white px-4 dotted-glow relative overflow-hidden">
        <div className="dot-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
        
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 z-10">
          <h2 className="text-xl font-semibold mb-4">Notes & Documents</h2>
          <p className="text-sm text-gray-400 mb-4">Quick notes and PDFs — saved locally to your browser.</p>

          {/* Input Section */}
          <div className="space-y-3 mb-4 bg-black/40 p-4 rounded-lg">
            <div className="flex gap-3">
              <input
                className="flex-1 px-2 py-1 rounded-md bg-black/40 border border-white/10 focus:outline-none text-white placeholder-gray-400 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write something..."
                onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }}
              />
              <button
                onClick={addNote}
                className="px-4 py-1 rounded-md text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Add Note
              </button>
            </div>

            {/* PDF Upload */}
            <div className="flex gap-3">
              <label className="flex-1 px-2 py-1 rounded-md bg-black/40 border border-white/10 border-dashed cursor-pointer hover:bg-white/5 transition flex items-center justify-center text-sm">
                <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                <span className="text-white text-sm">📄 Upload PDF</span>
              </label>
            </div>
          </div>

          {/* Notes List */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Notes</h3>
            <div className="h-36 overflow-y-auto space-y-2 p-3 bg-black/40 rounded-lg">
              {notes.length === 0 && <div className="text-sm text-gray-400">No notes yet.</div>}
              {notes.map((n) => (
                <div key={n.id} className="flex items-start justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                  <span className="text-sm">{n.text}</span>
                  <button
                    className="px-2 py-1 text-xs border border-white/10 rounded hover:bg-white/10 transition"
                    onClick={() => setNotes((s) => s.filter((note) => note.id !== n.id))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PDFs List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">PDFs</h3>
            <div className="h-36 overflow-y-auto space-y-2 p-3 bg-black/40 rounded-lg">
              {pdfs.length === 0 && <div className="text-sm text-gray-400">No PDFs uploaded yet.</div>}
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                  <a href={pdf.data} download={pdf.name} className="text-sm text-indigo-400 hover:text-indigo-300 truncate">
                    📄 {pdf.name}
                  </a>
                  <button
                    className="px-2 py-1 text-xs border border-white/10 rounded hover:bg-white/10 transition"
                    onClick={() => removePdf(pdf.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Notes;
