import { describe, expect, it } from "vitest";
import { budgetStatus, cardUsage, categoryRanking, summarize } from "../client/src/lib/finance";

const entries = [
  { type: "Receita" as const, date: "2026-09-05", category: "Renda", amount: 10000 },
  { type: "Despesa" as const, date: "2026-09-06", category: "Alimentação", amount: 680 },
  { type: "Despesa" as const, date: "2026-09-07", category: "Transporte", amount: 320 },
  { type: "Investimento" as const, date: "2026-09-08", category: "Renda fixa", amount: 2500 },
  { type: "Despesa" as const, date: "2026-08-08", category: "Lazer", amount: 900 },
];

describe("finance calculations", () => {
  it("summarizes a selected month without including other months", () => {
    expect(summarize(entries, "2026-09")).toEqual({ receitas: 10000, despesas: 1000, investimentos: 2500, saldo: 6500, taxaInvestimento: 0.25, taxaDespesas: 0.1 });
  });
  it("ranks spending categories from largest to smallest", () => {
    expect(categoryRanking(entries, "2026-09")).toEqual([{ category: "Alimentação", value: 680 }, { category: "Transporte", value: 320 }]);
  });
  it("marks budgets at 80% and 100% thresholds", () => {
    expect(budgetStatus(1000, 700).label).toBe("Dentro");
    expect(budgetStatus(1000, 800).label).toBe("Próximo");
    expect(budgetStatus(1000, 1001).label).toBe("Ultrapassado");
  });
  it("calculates available card limit and alert threshold", () => {
    expect(cardUsage(8000, 6800)).toMatchObject({ available: 1200, ratio: 0.85, alert: true });
  });
});
