import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownLeft, ArrowUpRight, BarChart3, Bell, CalendarDays, Check, ChevronRight,
  CircleDollarSign, CreditCard, Download, LayoutDashboard, Menu, Plus, Settings2,
  Target, TrendingUp, Wallet, X, Trash2, Pencil, Search, SlidersHorizontal,
} from "lucide-react";

type EntryType = "Receita" | "Despesa" | "Investimento";
type Transaction = {
  id: string; type: EntryType; date: string; description: string; category: string;
  amount: number; payment: string; account: string; installments?: number;
};
type Account = { id: string; name: string; type: string; balance: number };
type Card = { id: string; name: string; limit: number; closing: number; due: number };
type Investment = { id: string; name: string; category: string; value: number; currentValue: number };
type Goal = { id: string; name: string; target: number; current: number; deadline: string };
type Budget = { category: string; limit: number };
type Tab = "dashboard" | "lancamentos" | "investimentos" | "contas" | "metas";

const categories = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Compras", "Viagens", "Contas", "Assinaturas", "Outros"];
const investmentCategories = ["Reserva de emergência", "Renda fixa", "Tesouro Direto", "CDB", "LCI/LCA", "FIIs", "Ações", "ETFs", "Criptomoedas", "Outros"];
const colors = ["#2d6a4f", "#4f8f72", "#8fb996", "#f0b35b", "#e37b55", "#8b8bd8", "#4f83cc", "#a7b6c2"];
const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => new Date().toISOString().slice(0, 7);

const seedTransactions: Transaction[] = [
  { id: "demo-1", type: "Receita", date: today(), description: "Salário", category: "Renda", amount: 10000, payment: "Transferência", account: "Conta principal" },
  { id: "demo-2", type: "Despesa", date: today(), description: "Supermercado", category: "Alimentação", amount: 680, payment: "Crédito", account: "Cartão principal" },
  { id: "demo-3", type: "Investimento", date: today(), description: "Aporte mensal", category: "Renda fixa", amount: 2500, payment: "Transferência", account: "Conta investimentos" },
];
const initialAccounts: Account[] = [
  { id: "a1", name: "Conta principal", type: "Conta corrente", balance: 0 },
  { id: "a2", name: "Conta investimentos", type: "Investimentos", balance: 0 },
];
const initialCards: Card[] = [{ id: "c1", name: "Cartão principal", limit: 8000, closing: 10, due: 17 }];

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(`fin-${key}`); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function MetricCard({ label, value, detail, tone = "neutral", icon }: { label: string; value: string; detail?: string; tone?: string; icon: React.ReactNode }) {
  return <div className={`metric-card ${tone}`}><div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon">{icon}</span></div><strong>{value}</strong>{detail && <span className="metric-detail">{detail}</span>}</div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  const [month, setMonth] = useState(thisMonth());
  const [transactions, setTransactions] = useState<Transaction[]>(() => load("transactions", seedTransactions));
  const [accounts, setAccounts] = useState<Account[]>(() => load("accounts", initialAccounts));
  const [cards, setCards] = useState<Card[]>(() => load("cards", initialCards));
  const [investments, setInvestments] = useState<Investment[]>(() => load("investments", []));
  const [goals, setGoals] = useState<Goal[]>(() => load("goals", [{ id: "g1", name: "Reserva de emergência", target: 30000, current: 0, deadline: "2027-12" }]));
  const [budgets, setBudgets] = useState<Budget[]>(() => load("budgets", categories.slice(0, 6).map(category => ({ category, limit: category === "Alimentação" ? 1000 : category === "Transporte" ? 600 : 500 }))));
  const [entry, setEntry] = useState({ type: "Despesa" as EntryType, date: today(), description: "", category: "Alimentação", amount: "", payment: "PIX", account: "Conta principal", installments: "1" });
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [toast, setToast] = useState("");

  useEffect(() => { localStorage.setItem("fin-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("fin-accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem("fin-cards", JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem("fin-investments", JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem("fin-goals", JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem("fin-budgets", JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(""), 2800); return () => clearTimeout(timer); } }, [toast]);

  const selected = useMemo(() => transactions.filter(t => t.date.startsWith(month)), [transactions, month]);
  const income = useMemo(() => selected.filter(t => t.type === "Receita").reduce((s, t) => s + t.amount, 0), [selected]);
  const expenses = useMemo(() => selected.filter(t => t.type === "Despesa").reduce((s, t) => s + t.amount, 0), [selected]);
  const invested = useMemo(() => selected.filter(t => t.type === "Investimento").reduce((s, t) => s + t.amount, 0), [selected]);
  const year = month.slice(0, 4);
  const yearInvested = useMemo(() => transactions.filter(t => t.type === "Investimento" && t.date.startsWith(year)).reduce((s, t) => s + t.amount, 0), [transactions, year]);
  const available = income - expenses - invested;
  const accountTotal = accounts.reduce((s, a) => s + a.balance, 0);
  const investmentTotal = investments.reduce((s, i) => s + i.currentValue, 0);
  const netWorth = accountTotal + investmentTotal;

  const categoryData = useMemo(() => categories.map(category => ({ category, value: selected.filter(t => t.type === "Despesa" && t.category === category).reduce((s, t) => s + t.amount, 0) })).filter(x => x.value > 0).sort((a, b) => b.value - a.value), [selected]);
  const monthlyData = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const d = new Date(`${month}-01T12:00:00`); d.setMonth(d.getMonth() - (5 - index)); const key = d.toISOString().slice(0, 7);
    return { month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), receitas: transactions.filter(t => t.date.startsWith(key) && t.type === "Receita").reduce((s, t) => s + t.amount, 0), despesas: transactions.filter(t => t.date.startsWith(key) && t.type === "Despesa").reduce((s, t) => s + t.amount, 0), investimentos: transactions.filter(t => t.date.startsWith(key) && t.type === "Investimento").reduce((s, t) => s + t.amount, 0) };
  }), [transactions, month]);
  const filteredTransactions = useMemo(() => selected.filter(t => (filterCategory === "Todas" || t.category === filterCategory) && `${t.description} ${t.category} ${t.account}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date)), [selected, filterCategory, search]);
  const totalCardUsed = useMemo(() => transactions.filter(t => t.type === "Despesa" && t.payment === "Crédito").reduce((s, t) => s + t.amount, 0), [transactions]);

  function updateAccount(name: string, amount: number) {
    setAccounts(prev => prev.map(a => a.name === name ? { ...a, balance: a.balance + amount } : a));
  }
  function saveEntry() {
    const amount = Number(entry.amount.replace(",", "."));
    if (!entry.description.trim() || !amount || amount <= 0) { setToast("Informe descrição e valor para salvar."); return; }
    const next: Transaction = { id: uid(), type: entry.type, date: entry.date, description: entry.description.trim(), category: entry.category, amount, payment: entry.payment, account: entry.account, installments: Number(entry.installments) || 1 };
    setTransactions(prev => [next, ...prev]);
    if (entry.type === "Receita") updateAccount(entry.account, amount);
    if (entry.type === "Despesa" || entry.type === "Investimento") updateAccount(entry.account, -amount);
    if (entry.type === "Investimento") setInvestments(prev => [...prev, { id: uid(), name: entry.description.trim(), category: entry.category, value: amount, currentValue: amount }]);
    setEntry({ type: "Despesa", date: today(), description: "", category: "Alimentação", amount: "", payment: "PIX", account: "Conta principal", installments: "1" });
    setShowEntry(false); setToast("Lançamento salvo e indicadores atualizados.");
  }
  function removeTransaction(id: string) { setTransactions(prev => prev.filter(t => t.id !== id)); setToast("Lançamento removido."); }
  function nav(next: Tab) { setTab(next); setMobileMenu(false); }
  function addGoal() { setGoals(prev => [...prev, { id: uid(), name: "Nova meta", target: 10000, current: 0, deadline: "2027-12" }]); }
  function addCard() { setCards(prev => [...prev, { id: uid(), name: `Cartão ${prev.length + 1}`, limit: 5000, closing: 10, due: 17 }]); }
  function addAccount() { setAccounts(prev => [...prev, { id: uid(), name: `Conta ${prev.length + 1}`, type: "Conta corrente", balance: 0 }]); }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Visão geral", icon: <LayoutDashboard size={18} /> },
    { id: "lancamentos", label: "Lançamentos", icon: <ArrowDownLeft size={18} /> },
    { id: "investimentos", label: "Investimentos", icon: <TrendingUp size={18} /> },
    { id: "contas", label: "Contas e cartões", icon: <CreditCard size={18} /> },
    { id: "metas", label: "Metas e orçamento", icon: <Target size={18} /> },
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
      <div className="brand"><span className="brand-mark"><CircleDollarSign size={22} /></span><span>Clareza<span className="brand-dot">.</span></span></div>
      <div className="sidebar-label">MENU PRINCIPAL</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => nav(item.id)}>{item.icon}<span>{item.label}</span>{tab === item.id && <ChevronRight className="nav-arrow" size={15} />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="tip-card"><span className="tip-icon"><Bell size={16} /></span><div><strong>Seu próximo passo</strong><p>Registre um lançamento<br />e mantenha o ritmo.</p></div></div><button className="nav-item settings" onClick={() => setToast("Configurações simplificadas em breve.")}><Settings2 size={18} /><span>Configurações</span></button></div>
    </aside>
    {mobileMenu && <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileMenu(true)}><Menu size={22} /></button><div><p className="eyebrow">CONTROLE FINANCEIRO PESSOAL</p><h1>{tab === "dashboard" ? "Visão geral" : navItems.find(i => i.id === tab)?.label}</h1></div><div className="top-actions"><button className="icon-btn" onClick={() => setToast("Tudo em dia por aqui.")}><Bell size={18} /></button><button className="primary-btn" onClick={() => setShowEntry(true)}><Plus size={18} /> Novo lançamento</button></div></header>
      <div className="content-wrap">
        {tab === "dashboard" && <>
          <section className="welcome-row"><div><h2>Bom dia, organize seu dinheiro.</h2><p>Uma visão simples do que entrou, saiu e foi investido.</p></div><div className="period-select"><CalendarDays size={16} /><input type="month" value={month} onChange={e => setMonth(e.target.value)} /></div></section>
          <section className="metrics-grid"><MetricCard label="Receitas do mês" value={brl(income)} detail="Tudo que entrou" tone="green" icon={<ArrowUpRight size={18} />} /><MetricCard label="Despesas do mês" value={brl(expenses)} detail={`${income ? Math.round(expenses / income * 100) : 0}% da renda`} tone="orange" icon={<ArrowDownLeft size={18} />} /><MetricCard label="Investido no mês" value={brl(invested)} detail={`${income ? Math.round(invested / income * 100) : 0}% da renda`} tone="blue" icon={<TrendingUp size={18} />} /><MetricCard label="Saldo disponível" value={brl(available)} detail="Receitas - saídas" tone="purple" icon={<Wallet size={18} />} /></section>
          <section className="main-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h3>Fluxo dos últimos meses</h3><p>Receitas, despesas e investimentos</p></div><BarChart3 size={20} className="muted-icon" /></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={240}><AreaChart data={monthlyData}><defs><linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.22}/><stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/></linearGradient><linearGradient id="expense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e37b55" stopOpacity={0.18}/><stop offset="95%" stopColor="#e37b55" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="4 4" stroke="#edf1ee" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#83908a", fontSize: 12 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#83908a", fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`}/><Tooltip formatter={(v: number) => brl(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e7ece8", boxShadow: "0 8px 24px #18352a14" }}/><Area type="monotone" dataKey="receitas" stroke="#2d6a4f" fill="url(#income)" strokeWidth={2.5} name="Receitas"/><Area type="monotone" dataKey="despesas" stroke="#e37b55" fill="url(#expense)" strokeWidth={2.5} name="Despesas"/><Area type="monotone" dataKey="investimentos" stroke="#4f83cc" fill="transparent" strokeWidth={2} name="Investimentos"/></AreaChart></ResponsiveContainer></div><div className="legend"><span><i className="dot green-dot" />Receitas</span><span><i className="dot orange-dot" />Despesas</span><span><i className="dot blue-dot" />Investimentos</span></div></div>
            <div className="panel donut-panel"><div className="panel-heading"><div><h3>Onde você gastou</h3><p>{categoryData.length ? "Distribuição por categoria" : "Sem despesas no período"}</p></div><button className="text-btn" onClick={() => nav("lancamentos")}>Ver tudo <ChevronRight size={14} /></button></div>{categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height={170}><PieChart><Pie data={categoryData.slice(0, 6)} dataKey="value" nameKey="category" innerRadius={52} outerRadius={76} paddingAngle={3}>{categoryData.slice(0, 6).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip formatter={(v: number) => brl(v)} /></PieChart></ResponsiveContainer><div className="donut-total"><strong>{brl(expenses)}</strong><span>total gasto</span></div></div><div className="category-list">{categoryData.slice(0, 4).map((item, i) => <div className="category-row" key={item.category}><span><i className="dot" style={{ background: colors[i] }} />{item.category}</span><strong>{brl(item.value)}</strong></div>)}</div></> : <EmptyState text="Seus gastos por categoria aparecerão aqui." />}</div></section>
          <section className="bottom-grid"><div className="panel"><div className="panel-heading"><div><h3>Últimos lançamentos</h3><p>Movimentações de {new Date(`${month}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p></div><button className="text-btn" onClick={() => nav("lancamentos")}>Ver todos <ChevronRight size={14} /></button></div><TransactionList transactions={selected.slice(0, 5)} onRemove={removeTransaction} /></div><div className="panel progress-panel"><div className="panel-heading"><div><h3>Meta de investimento</h3><p>Seu ritmo neste mês</p></div><Target size={20} className="muted-icon" /></div><div className="big-progress"><div className="progress-ring"><strong>{Math.min(100, Math.round((invested / 3000) * 100))}%</strong><span>atingido</span></div><div><strong className="progress-value">{brl(invested)}</strong><span className="muted">de {brl(3000)}</span><p className="success-text"><Check size={14} /> Continue assim</p></div></div><div className="progress-bar"><span style={{ width: `${Math.min(100, (invested / 3000) * 100)}%` }} /></div><button className="secondary-btn full" onClick={() => nav("metas")}>Ver metas e orçamento</button></div></section>
        </>}
        {tab === "lancamentos" && <TransactionsPage transactions={filteredTransactions} search={search} setSearch={setSearch} filterCategory={filterCategory} setFilterCategory={setFilterCategory} onRemove={removeTransaction} onNew={() => setShowEntry(true)} month={month} setMonth={setMonth} />}
        {tab === "investimentos" && <InvestmentsPage investments={investments} invested={invested} yearInvested={yearInvested} total={investmentTotal} onNew={() => { setEntry(e => ({ ...e, type: "Investimento", category: "Renda fixa" })); setShowEntry(true); }} />}
        {tab === "contas" && <AccountsPage accounts={accounts} cards={cards} totalCardUsed={totalCardUsed} onAddAccount={addAccount} onAddCard={addCard} />}
        {tab === "metas" && <GoalsPage goals={goals} setGoals={setGoals} budgets={budgets} setBudgets={setBudgets} selected={selected} onAddGoal={addGoal} />}
      </div>
    </main>
    {showEntry && <EntryModal entry={entry} setEntry={setEntry} onClose={() => setShowEntry(false)} onSave={saveEntry} accounts={accounts} cards={cards} />}
    {toast && <div className="toast"><Check size={16} />{toast}</div>}
  </div>;
}

function EmptyState({ text }: { text: string }) { return <div className="empty-state"><span className="empty-icon"><BarChart3 size={20} /></span><p>{text}</p></div>; }

function TransactionList({ transactions, onRemove }: { transactions: Transaction[]; onRemove: (id: string) => void }) {
  if (!transactions.length) return <EmptyState text="Nenhum lançamento neste período." />;
  return <div className="transaction-list">{transactions.map(t => <div className="transaction-row" key={t.id}><span className={`transaction-icon ${t.type === "Receita" ? "income-icon" : t.type === "Investimento" ? "investment-icon" : "expense-icon"}`}>{t.type === "Receita" ? <ArrowUpRight size={16} /> : t.type === "Investimento" ? <TrendingUp size={16} /> : <ArrowDownLeft size={16} />}</span><div className="transaction-info"><strong>{t.description}</strong><span>{t.category} · {t.account}</span></div><span className={`transaction-amount ${t.type === "Receita" ? "positive" : ""}`}>{t.type === "Despesa" ? "-" : "+"}{brl(t.amount)}</span><button className="row-delete" onClick={() => onRemove(t.id)} title="Excluir"><Trash2 size={14} /></button></div>)}</div>;
}

function TransactionsPage({ transactions, search, setSearch, filterCategory, setFilterCategory, onRemove, onNew, month, setMonth }: { transactions: Transaction[]; search: string; setSearch: (v: string) => void; filterCategory: string; setFilterCategory: (v: string) => void; onRemove: (id: string) => void; onNew: () => void; month: string; setMonth: (v: string) => void }) {
  const expenses = transactions.filter(t => t.type === "Despesa"); const total = expenses.reduce((s, t) => s + t.amount, 0); const largest = expenses.reduce((a, b) => (a.amount > b.amount ? a : b), expenses[0]);
  return <><section className="page-intro"><div><h2>Seu histórico financeiro</h2><p>Filtre e acompanhe cada movimentação com clareza.</p></div><button className="primary-btn" onClick={onNew}><Plus size={18} /> Novo lançamento</button></section><section className="mini-metrics"><div><span>Total gasto</span><strong>{brl(total)}</strong></div><div><span>Lançamentos</span><strong>{transactions.length}</strong></div><div><span>Maior gasto</span><strong>{largest ? brl(largest.amount) : brl(0)}</strong></div><div><span>Categoria líder</span><strong>{expenses[0]?.category || "—"}</strong></div></section><div className="panel filters-panel"><div className="filters"><div className="search-field"><Search size={16} /><input placeholder="Buscar lançamento" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="select-field"><CalendarDays size={16} /><input type="month" value={month} onChange={e => setMonth(e.target.value)} /></div><div className="select-field"><SlidersHorizontal size={16} /><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}><option>Todas</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div></div></div><div className="panel"><div className="panel-heading"><div><h3>Movimentações</h3><p>{transactions.length} resultado(s) encontrado(s)</p></div><button className="secondary-btn"><Download size={15} /> Exportar</button></div><TransactionList transactions={transactions} onRemove={onRemove} /></div></>;
}

function InvestmentsPage({ investments, invested, yearInvested, total, onNew }: { investments: Investment[]; invested: number; yearInvested: number; total: number; onNew: () => void }) {
  const byCategory = investmentCategories.map(category => ({ category, value: investments.filter(i => i.category === category).reduce((s, i) => s + i.currentValue, 0) })).filter(x => x.value > 0);
  return <><section className="page-intro"><div><h2>Invista no seu futuro</h2><p>Acompanhe seus aportes sem complicar.</p></div><button className="primary-btn" onClick={onNew}><Plus size={18} /> Registrar aporte</button></section><section className="metrics-grid"><MetricCard label="Investido no mês" value={brl(invested)} detail="Aportes do período" tone="blue" icon={<TrendingUp size={18} />} /><MetricCard label="Investido no ano" value={brl(yearInvested)} detail="Aportes acumulados" tone="green" icon={<BarChart3 size={18} />} /><MetricCard label="Patrimônio investido" value={brl(total)} detail="Valor atual da carteira" tone="purple" icon={<Wallet size={18} />} /></section><section className="main-grid"><div className="panel"><div className="panel-heading"><div><h3>Carteira atual</h3><p>Distribuição por categoria</p></div></div>{byCategory.length ? <div className="investment-bars">{byCategory.map((x, i) => <div className="investment-bar-row" key={x.category}><div><span>{x.category}</span><strong>{brl(x.value)}</strong></div><div className="bar-track"><span style={{ width: `${total ? x.value / total * 100 : 0}%`, background: colors[i % colors.length] }} /></div></div>)}</div> : <EmptyState text="Registre seu primeiro aporte para ver sua carteira." />}</div><div className="panel"><div className="panel-heading"><div><h3>Últimos aportes</h3><p>Histórico da carteira</p></div></div><TransactionList transactions={investments.map(i => ({ id: i.id, type: "Investimento" as EntryType, date: today(), description: i.name, category: i.category, amount: i.value, payment: "", account: "" })).slice(0, 6)} onRemove={() => undefined} /></div></section></>;
}

function AccountsPage({ accounts, cards, totalCardUsed, onAddAccount, onAddCard }: { accounts: Account[]; cards: Card[]; totalCardUsed: number; onAddAccount: () => void; onAddCard: () => void }) {
  return <><section className="page-intro"><div><h2>Contas e cartões</h2><p>Saiba onde seu dinheiro está agora.</p></div><div className="button-group"><button className="secondary-btn" onClick={onAddAccount}><Plus size={15} /> Conta</button><button className="primary-btn" onClick={onAddCard}><Plus size={15} /> Cartão</button></div></section><section className="account-section"><div className="section-title"><h3>Contas bancárias</h3><span>{brl(accounts.reduce((s, a) => s + a.balance, 0))} total</span></div><div className="account-grid">{accounts.map(a => <div className="account-card" key={a.id}><div className="account-card-top"><span className="account-icon"><Wallet size={18} /></span><button className="kebab">···</button></div><span className="account-type">{a.type}</span><strong>{a.name}</strong><div className="account-balance">{brl(a.balance)}</div></div>)}</div></section><div className="account-section"><div className="section-title"><h3>Cartões de crédito</h3><span>{brl(totalCardUsed)} utilizado</span></div><div className="card-grid">{cards.map(card => { const used = totalCardUsed; const percent = Math.min(100, used / card.limit * 100); return <div className="credit-card" key={card.id}><div className="credit-top"><span>{card.name}</span><CreditCard size={20} /></div><strong>{brl(used)}</strong><span className="credit-caption">fatura atual</span><div className="credit-progress"><span style={{ width: `${percent}%` }} /></div><div className="credit-foot"><span>Limite disponível<br /><b>{brl(Math.max(0, card.limit - used))}</b></span><span>Vence dia<br /><b>{card.due}</b></span></div>{percent >= 80 && <div className="card-alert"><Bell size={14} /> Próximo do limite</div>}</div> })}</div></div></>;
}

function GoalsPage({ goals, setGoals, budgets, setBudgets, selected, onAddGoal }: { goals: Goal[]; setGoals: React.Dispatch<React.SetStateAction<Goal[]>>; budgets: Budget[]; setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>; selected: Transaction[]; onAddGoal: () => void }) {
  return <><section className="page-intro"><div><h2>Metas e orçamento</h2><p>Pequenos limites tornam grandes planos possíveis.</p></div><button className="primary-btn" onClick={onAddGoal}><Plus size={18} /> Nova meta</button></section><section className="goals-section"><div className="section-title"><h3>Suas metas</h3><span>{goals.length} ativa(s)</span></div><div className="goal-grid">{goals.map((goal, index) => { const pct = Math.min(100, goal.target ? goal.current / goal.target * 100 : 0); return <div className="goal-card" key={goal.id}><div className="goal-top"><span className="goal-number">0{index + 1}</span><button className="kebab">···</button></div><input className="inline-title" value={goal.name} onChange={e => setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, name: e.target.value } : g))} /><div className="goal-values"><strong>{brl(goal.current)}</strong><span>de {brl(goal.target)}</span></div><div className="bar-track"><span style={{ width: `${pct}%` }} /></div><div className="goal-footer"><span>{Math.round(pct)}% concluído</span><span>Até {goal.deadline}</span></div></div> })}</div></section><section className="panel budget-panel"><div className="panel-heading"><div><h3>Orçamento mensal</h3><p>Defina limites para as categorias que mais importam.</p></div><Target size={20} className="muted-icon" /></div><div className="budget-list">{budgets.map(b => { const used = selected.filter(t => t.type === "Despesa" && t.category === b.category).reduce((s, t) => s + t.amount, 0); const pct = b.limit ? used / b.limit * 100 : 0; return <div className="budget-row" key={b.category}><div className="budget-name"><strong>{b.category}</strong><span>{brl(used)} usados</span></div><div className="budget-bar"><span className={pct >= 100 ? "over" : pct >= 80 ? "near" : "ok"} style={{ width: `${Math.min(100, pct)}%` }} /></div><div className="budget-limit"><input type="number" value={b.limit} onChange={e => setBudgets(prev => prev.map(x => x.category === b.category ? { ...x, limit: Number(e.target.value) } : x))} /><span>{pct >= 100 ? "Ultrapassado" : pct >= 80 ? "Próximo" : "Dentro"}</span></div></div> })}</div></section></>;
}

function EntryModal({ entry, setEntry, onClose, onSave, accounts, cards }: { entry: { type: EntryType; date: string; description: string; category: string; amount: string; payment: string; account: string; installments: string }; setEntry: React.Dispatch<React.SetStateAction<{ type: EntryType; date: string; description: string; category: string; amount: string; payment: string; account: string; installments: string }>>; onClose: () => void; onSave: () => void; accounts: Account[]; cards: Card[] }) {
  const field = (key: keyof typeof entry, value: string) => setEntry(prev => ({ ...prev, [key]: value }));
  const isInvestment = entry.type === "Investimento";
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="entry-modal"><div className="modal-header"><div><span className="eyebrow">NOVO LANÇAMENTO</span><h2>{isInvestment ? "Registrar aporte" : "O que aconteceu?"}</h2></div><button className="close-btn" onClick={onClose}><X size={20} /></button></div><div className="type-toggle">{(["Despesa", "Receita", "Investimento"] as EntryType[]).map(type => <button key={type} className={entry.type === type ? `selected ${type.toLowerCase()}` : ""} onClick={() => field("type", type)}>{type === "Despesa" ? <ArrowDownLeft size={16} /> : type === "Receita" ? <ArrowUpRight size={16} /> : <TrendingUp size={16} />}{type}</button>)}</div><div className="form-grid"><label className="wide">Descrição<input autoFocus placeholder={isInvestment ? "Ex.: Aporte em CDB" : "Ex.: Supermercado"} value={entry.description} onChange={e => field("description", e.target.value)} /></label><label>Valor<input inputMode="decimal" placeholder="R$ 0,00" value={entry.amount} onChange={e => field("amount", e.target.value)} /></label><label>Data<input type="date" value={entry.date} onChange={e => field("date", e.target.value)} /></label><label>Categoria<select value={entry.category} onChange={e => field("category", e.target.value)}>{(isInvestment ? investmentCategories : entry.type === "Receita" ? ["Salário", "Pró-labore", "Freelance", "Renda extra", "Dividendos", "Outros"] : categories).map(c => <option key={c}>{c}</option>)}</select></label><label>Forma de pagamento<select value={entry.payment} onChange={e => field("payment", e.target.value)}><option>PIX</option><option>Débito</option><option>Crédito</option><option>Transferência</option><option>Dinheiro</option></select></label><label>Conta ou cartão<select value={entry.account} onChange={e => field("account", e.target.value)}>{accounts.map(a => <option key={a.id}>{a.name}</option>)}{cards.map(c => <option key={c.id}>{c.name}</option>)}</select></label><label>Parcelas<input type="number" min="1" value={entry.installments} onChange={e => field("installments", e.target.value)} /></label></div><div className="modal-foot"><span className="modal-hint"><Check size={15} /> Atualiza todos os indicadores automaticamente</span><button className="primary-btn save-btn" onClick={onSave}>Salvar lançamento <ArrowUpRight size={16} /></button></div></div></div>;
}
