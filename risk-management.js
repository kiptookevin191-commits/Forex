const RiskManagement = {
  getBalance() { return parseFloat(document.getElementById('tool-balance').value) || 1000; },
  getRiskPercent() { return parseFloat(document.getElementById('tool-risk').value) || 0.25; },
  calculateLotSize(slPips) {
    const balance = this.getBalance();
    const riskAmount = balance * (this.getRiskPercent() / 100);
    const pipValue = 10; 
    const lot = riskAmount / (slPips * pipValue);
    return Math.max(0.01, Math.round(lot * 100) / 100);
  }
};
