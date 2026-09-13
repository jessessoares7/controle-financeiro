export type FinanceEntry = { type: "Receita" | "Despesa" | "Investimento"; date: string; category: string; amount: number };

export function summarize(entries: FinanceEntry[], month: string) {
  const selected = entries.filter(entry => entry.date.startsWith(month));
  const sum = (type: FinanceEntry["type"]) => selected.filter(entry => entry.type === type).reduce((total, entry) => total + entry.amount, 0);
  const receitas = sum("Receita");
  const despesas = sum("Despesa");
  const investimentos = sum("Investimento");
  return { receitas, despesas, investimentos, saldo: receitas - despesas - investimentos, taxaInvestimento: receitas ? investimentos / receitas : 0, taxaDespesas: receitas ? despesas / receitas : 0 };
}

export function categoryRanking(entries: FinanceEntry[], month: string) {
  const totals = new Map<string, number>();
  entries.filter(entry => entry.date.startsWith(month) && entry.type === "Despesa").forEach(entry => totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount));
  return Array.from(totals.entries()).map(([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);
}

export function budgetStatus(limit: number, used: number) {
  const ratio = limit > 0 ? used / limit : 0;
  return { ratio, label: ratio >= 1 ? "Ultrapassado" : ratio >= 0.8 ? "Próximo" : "Dentro" } as const;
}

export function cardUsage(limit: number, used: number) {
  const ratio = limit > 0 ? used / limit : 0;
  return { used, available: Math.max(0, limit - used), ratio, alert: ratio >= 0.8 };
}
