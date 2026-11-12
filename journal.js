document.addEventListener('DOMContentLoaded', () => {
  const getJournal = () => JSON.parse(localStorage.getItem('journal') || '[]');

  document.getElementById('btn-add-journal')?.addEventListener('click', () => {
    const dir = document.getElementById('journal-direction').value;
    const lot = parseFloat(document.getElementById('journal-lot').value);
    const entry = parseFloat(document.getElementById('journal-entry').value);
    const exit = parseFloat(document.getElementById('journal-exit').value);
    if (!lot || !entry || !exit) return alert('Fill all fields');
    
    const pips = dir === 'BUY' ? (exit - entry)/0.0001 : (entry - exit)/0.0001;
    const pl = pips * 10 * lot;
    
    const j = getJournal();
    j.unshift({ date: new Date().toLocaleDateString(), dir, lot, entry, exit, pl });
    localStorage.setItem('journal', JSON.stringify(j));
    renderJournal();
  });

  document.getElementById('btn-export-journal')?.addEventListener('click', () => {
    const j = getJournal();
    if (!j.length) return alert('No trades.');
    let csv = "Date,Direction,Lot,Entry,Exit,P/L\n";
    j.forEach(t => csv += `${t.date},${t.dir},${t.lot},${t.entry},${t.exit},${t.pl.toFixed(2)}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'journal.csv';
    a.click();
  });

  function renderJournal() {
    const j = getJournal();
    const wins = j.filter(t => t.pl > 0).length;
    document.getElementById('j-total').textContent = j.length;
    document.getElementById('j-winrate').textContent = j.length ? ((wins/j.length)*100).toFixed(1)+'%' : '—';
    document.getElementById('journal-list').innerHTML = j.map(t => `
      <div class="trade-item ${t.dir === 'BUY' ? 'buy' : 'sell'}">
        <strong>${t.dir} ${t.lot} lots</strong> | P/L: <span style="color:${t.pl >=0 ? 'var(--green)' : 'var(--red)'}">$${t.pl.toFixed(2)}</span>
      </div>
    `).join('');
  }
  renderJournal();
});
