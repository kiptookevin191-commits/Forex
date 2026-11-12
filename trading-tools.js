document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-calc-lot')?.addEventListener('click', () => {
    const sl = parseFloat(document.getElementById('tool-sl-pips').value);
    if (!sl || sl <= 0) return alert('Enter valid Stop Loss in pips.');
    const lot = RiskManagement.calculateLotSize(sl);
    document.getElementById('tool-lot-result').textContent = lot.toFixed(2) + ' lots';
  });
});
