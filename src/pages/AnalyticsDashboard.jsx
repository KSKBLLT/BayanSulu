import React, { useState, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const OPENAI_KEY = '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';

// ── Mock data ────────────────────────────────────────────────────────────────
const qrScans = [
  { product: 'Байтерек (Астана)', scans: 142, unlocks: 118, rate: 83 },
  { product: 'Горы Алматы',       scans: 97,  unlocks: 71,  rate: 73 },
  { product: 'Чарын',             scans: 61,  unlocks: 38,  rate: 62 },
  { product: 'Туркестан',         scans: 44,  unlocks: 27,  rate: 61 },
  { product: 'Степная локация',   scans: 29,  unlocks: 14,  rate: 48 },
];

const gameStats = [
  { id: 'math',   label: 'Счёт с КамБотом', emoji: '🔢', starts: 304, completes: 261, avgScore: 87, coins: 2349 },
  { id: 'memory', label: 'Казахские пары',   emoji: '🃏', starts: 289, completes: 214, avgScore: 74, coins: 2140 },
  { id: 'words',  label: 'Казахские слова',  emoji: '🈳', starts: 271, completes: 198, avgScore: 73, coins: 1980 },
];

const rewardStats = [
  { label: 'Мороженое 🍦',    requests: 54, approved: 41, redemptions: 38 },
  { label: 'Прогулка 🚶',     requests: 47, approved: 39, redemptions: 35 },
  { label: 'Кино 🎬',         requests: 31, approved: 19, redemptions: 17 },
  { label: 'Планшет +30 мин', requests: 28, approved: 15, redemptions: 12 },
];

const dropOffData = [
  { stage: 'Установка',       users: 520, pct: 100 },
  { stage: 'Онбординг',       users: 491, pct: 94 },
  { stage: '1-я игра',        users: 404, pct: 78 },
  { stage: '2-я игра',        users: 291, pct: 56 },
  { stage: '3-я игра',        users: 198, pct: 38 },
  { stage: 'QR-сканирование', users: 118, pct: 23 },
  { stage: 'Запрос бонуса',   users: 89,  pct: 17 },
];

const parentStats = {
  totalSessions: 182,
  avgSessionMin: 3.4,
  approvalRate: 76,
  weeklyActive: 64,
};

// Static fallback insights (shown before AI generates)
const staticInsights = [
  { icon: '📍', title: 'Усильте локацию «Степная»', text: 'QR-конверсия всего 48% — добавьте подсказку на упаковке как добраться до QR-кода. Остальные локации показывают 73–83%.', tag: 'QR', color: '#FF7043' },
  { icon: '🎮', title: 'Игра «Казахские слова» теряет игроков', text: '27% не завершают. Рассмотрите снижение сложности первых 3 вопросов или добавление подсказок с картинкой.', tag: 'Игры', color: '#7E57C2' },
  { icon: '🎁', title: 'Купоны «Кино» плохо конвертируются', text: 'Только 35% одобренных купонов «Кино» используются — возможно, цена слишком высокая. Попробуйте снизить порог до 25 монет.', tag: 'Бонусы', color: '#26A69A' },
  { icon: '📱', title: 'Масштабируйте QR-кампанию Байтерека', text: '83% конверсия — лучший показатель. Используйте этот дизайн QR-карточки как шаблон для новых локаций.', tag: 'QR', color: '#42A5F5' },
  { icon: '👨‍👩‍👧', title: 'Вовлекайте родителей на 2-й день', text: 'Родительский режим открывают только после 3-й игры. Пуш-уведомление после 1-й игры увеличит вовлечённость на ~30%.', tag: 'Родители', color: '#EC407A' },
];

// ── OpenAI helper ────────────────────────────────────────────────────────────
async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты — product-аналитик образовательного приложения «Баян Сулу» для казахских детей. Отвечай строго по-русски. Давай конкретные, операционные рекомендации. Используй эмодзи для выделения ключевых моментов.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 900,
      temperature: 0.75,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '(пустой ответ)';
}

const AI_PROMPT = `Ты анализируешь данные детского образовательного приложения «Баян Сулу» (Казахстан).

ДАННЫЕ ЗА 30 ДНЕЙ:
QR-конверсия: Байтерек 83%, Горы Алматы 73%, Чарын 62%, Туркестан 61%, Степная 48%
Завершаемость игр: Математика 86%, Память 74%, Казахские слова 73%
Воронка: Установка 520 → Онбординг 491 (94%) → 1-я игра 404 (78%) → Все 3 игры 198 (38%) → QR 118 (23%) → Бонус 89 (17%)
Бонусы: 160 запросов, 76% одобрено. Redemption: Мороженое 93%, Прогулка 90%, Кино 35%, Планшет 80%
Родители: 182 сессии, 3.4 мин сред., 76% одобряют бонусы, 64 активных/нед.

ЗАДАЧА: Дай 5 приоритизированных инсайта. Каждый инсайт в формате:
[ПРИОРИТЕТ: HIGH/MEDIUM/LOW] {эмодзи} Заголовок
Проблема: ...
Решение: ...
Ожидаемый результат: ...

Разделяй инсайты строкой из трёх дефисов (---).`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function StatCard({ value, label, sub, color }) {
  return (
    <div className="dash-stat" style={{ '--dash-color': color || 'var(--primary)' }}>
      <span className="dash-stat__value">{value}</span>
      <span className="dash-stat__label">{label}</span>
      {sub && <span className="dash-stat__sub">{sub}</span>}
    </div>
  );
}

function MiniBar({ value, max, color }) {
  return (
    <div className="dash-minibar">
      <div className="dash-minibar__fill" style={{ width: `${Math.round((value / max) * 100)}%`, background: color || 'var(--primary)' }} />
    </div>
  );
}

function AIInsightCard({ text, index }) {
  const lines = text.trim().split('\n').filter(Boolean);
  const headerLine = lines[0] || '';
  const body = lines.slice(1).join('\n');

  const priorityMatch = headerLine.match(/\[(HIGH|MEDIUM|LOW)\]/i);
  const priority = priorityMatch ? priorityMatch[1].toUpperCase() : null;
  const priorityColor = priority === 'HIGH' ? '#EF5350' : priority === 'MEDIUM' ? '#EA9228' : '#4DB6AC';

  const cleanHeader = headerLine.replace(/\[.*?\]/g, '').trim();

  return (
    <Card className="stack ai-insight-card" style={{ borderLeft: `4px solid ${priorityColor}` }}>
      <div className="ai-insight-head">
        <span className="ai-insight-icon" style={{ background: priorityColor + '20', color: priorityColor, fontSize: '1rem', fontWeight: 700 }}>
          {index + 1}
        </span>
        <div>
          {priority && (
            <div className="ai-insight-tag" style={{ color: priorityColor }}>
              {priority === 'HIGH' ? '🔴' : priority === 'MEDIUM' ? '🟡' : '🟢'} {priority}
            </div>
          )}
          <h4 className="ai-insight-title">{cleanHeader}</h4>
        </div>
      </div>
      <p className="muted ai-insight-text" style={{ whiteSpace: 'pre-line' }}>{body}</p>
    </Card>
  );
}

const TABS = ['Обзор', 'QR-коды', 'Игры', 'Бонусы', 'Воронка', 'AI Insights'];

// ── Main ─────────────────────────────────────────────────────────────────────
function AnalyticsDashboard({ goToScreen }) {
  const [tab, setTab] = useState('Обзор');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsightsText, setAiInsightsText] = useState('');
  const [aiError, setAiError] = useState('');
  const [useStatic, setUseStatic] = useState(true);

  const generateInsights = useCallback(async () => {
    setAiLoading(true);
    setAiError('');
    setUseStatic(false);
    try {
      const result = await callOpenAI(AI_PROMPT);
      setAiInsightsText(result);
    } catch (err) {
      setAiError('Ошибка: ' + err.message);
      setUseStatic(true);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const aiInsightBlocks = aiInsightsText
    ? aiInsightsText.split(/\n---\n|^---$/m).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <section className="screen dash-screen">

      {/* Header bar */}
      <Card className="dash-header-card">
        <div className="dash-header-top">
          <div>
            <span className="badge badge-muted">Баян Сулу · Аналитика</span>
            <h2 className="hero-title" style={{ marginTop: '0.25rem' }}>Business Dashboard</h2>
            <p className="muted">Данные за последние 30 дней · Демо-режим</p>
          </div>
          <Button variant="ghost" onClick={() => goToScreen('parent')}>← Назад</Button>
        </div>
        <div className="dash-kpi-row">
          <StatCard value="520"  label="Пользователей" sub="+18% м/м" color="#4DB6AC" />
          <StatCard value="864"  label="Игр сыграно"   sub="за 30 дней" color="#EA9228" />
          <StatCard value="373"  label="QR-сканов"     sub="5 локаций" color="#7E57C2" />
          <StatCard value="160"  label="Бонус-запросов" sub="76% одобрено" color="#EC407A" />
        </div>
      </Card>

      {/* Tab navigation */}
      <div className="dash-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`dash-tab ${tab === t ? 'dash-tab--active' : ''}`} onClick={() => setTab(t)}>
            {t === 'AI Insights' ? '✨ ' : ''}{t}
          </button>
        ))}
      </div>

      {/* ── Обзор ── */}
      {tab === 'Обзор' && (
        <div className="dash-section stack">
          <Card className="stack">
            <h3 className="section-title">Топ игр по завершению</h3>
            {gameStats.map((g) => (
              <div key={g.id} className="dash-row">
                <span className="dash-row__emoji">{g.emoji}</span>
                <div className="dash-row__body">
                  <div className="dash-row__name">{g.label}</div>
                  <MiniBar value={g.completes} max={g.starts} color="#4DB6AC" />
                </div>
                <span className="dash-row__value">{Math.round(g.completes / g.starts * 100)}%</span>
              </div>
            ))}
          </Card>
          <Card className="stack">
            <h3 className="section-title">QR-конверсия по продуктам</h3>
            {qrScans.slice(0, 3).map((q) => (
              <div key={q.product} className="dash-row">
                <span className="dash-row__emoji">📍</span>
                <div className="dash-row__body">
                  <div className="dash-row__name">{q.product}</div>
                  <MiniBar value={q.unlocks} max={q.scans} color="#EA9228" />
                </div>
                <span className="dash-row__value">{q.rate}%</span>
              </div>
            ))}
          </Card>
          <Card className="stack">
            <h3 className="section-title">Родительский режим</h3>
            <div className="dash-kpi-row dash-kpi-row--small">
              <StatCard value={parentStats.totalSessions} label="Сессий" color="#EC407A" />
              <StatCard value={`${parentStats.avgSessionMin} мин`} label="Сред. сессия" color="#7E57C2" />
              <StatCard value={`${parentStats.approvalRate}%`} label="Одобряют" color="#42A5F5" />
              <StatCard value={`${parentStats.weeklyActive}`} label="Активных/нед." color="#4DB6AC" />
            </div>
          </Card>
        </div>
      )}

      {/* ── QR-коды ── */}
      {tab === 'QR-коды' && (
        <div className="dash-section stack">
          <Card className="stack">
            <h3 className="section-title">QR-статистика по локациям</h3>
            <div className="dash-table">
              <div className="dash-table__head"><span>Продукт</span><span>Сканов</span><span>Разблокировано</span><span>Конверсия</span></div>
              {qrScans.map((q) => (
                <div key={q.product} className="dash-table__row">
                  <span className="dash-table__name">📍 {q.product}</span>
                  <span>{q.scans}</span>
                  <span>{q.unlocks}</span>
                  <span className={`dash-rate ${q.rate >= 75 ? 'dash-rate--good' : q.rate >= 60 ? 'dash-rate--ok' : 'dash-rate--low'}`}>{q.rate}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="info-card"><h4 style={{ marginBottom: '0.5rem' }}>💡 Вывод</h4><p className="muted">Байтерек и Горы Алматы — лидеры (73–83%). Степная локация требует улучшения дизайна QR-карточки.</p></Card>
        </div>
      )}

      {/* ── Игры ── */}
      {tab === 'Игры' && (
        <div className="dash-section stack">
          {gameStats.map((g) => (
            <Card key={g.id} className="stack">
              <div className="dash-game-head">
                <span className="dash-game-emoji">{g.emoji}</span>
                <div>
                  <h3 className="section-title">{g.label}</h3>
                  <p className="muted">Завершений: {g.completes} из {g.starts}</p>
                </div>
                <span className={`badge ${g.completes / g.starts >= 0.8 ? 'badge-success' : 'badge-muted'}`}>{Math.round(g.completes / g.starts * 100)}%</span>
              </div>
              <div className="dash-kpi-row dash-kpi-row--small">
                <StatCard value={g.starts} label="Запусков" color="#4DB6AC" />
                <StatCard value={g.completes} label="Завершений" color="#EA9228" />
                <StatCard value={`${g.avgScore}%`} label="Ср. результат" color="#7E57C2" />
                <StatCard value={g.coins} label="Монет выдано" color="#42A5F5" />
              </div>
              <MiniBar value={g.completes} max={g.starts} color="#4DB6AC" />
            </Card>
          ))}
        </div>
      )}

      {/* ── Бонусы ── */}
      {tab === 'Бонусы' && (
        <div className="dash-section stack">
          <Card className="stack">
            <h3 className="section-title">Мотивация через награды</h3>
            <div className="dash-table">
              <div className="dash-table__head"><span>Бонус</span><span>Запросов</span><span>Одобрено</span><span>Использовано</span></div>
              {rewardStats.map((r) => (
                <div key={r.label} className="dash-table__row">
                  <span className="dash-table__name">{r.label}</span>
                  <span>{r.requests}</span>
                  <span>{r.approved}</span>
                  <span className={`dash-rate ${r.redemptions / r.approved >= 0.8 ? 'dash-rate--good' : 'dash-rate--ok'}`}>{r.redemptions} ({Math.round(r.redemptions / r.approved * 100)}%)</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="info-card"><h4 style={{ marginBottom: '0.5rem' }}>💡 Вывод</h4><p className="muted">Мороженое и Прогулка — самые популярные и конвертируемые бонусы. Кино используется хуже — стоит снизить порог.</p></Card>
        </div>
      )}

      {/* ── Воронка ── */}
      {tab === 'Воронка' && (
        <div className="dash-section stack">
          <Card className="stack">
            <h3 className="section-title">Воронка пользователей</h3>
            <p className="muted" style={{ marginBottom: '1rem' }}>Где теряются пользователи?</p>
            {dropOffData.map((stage, i) => (
              <div key={stage.stage} className="dash-funnel-row">
                <div className="dash-funnel-label"><span className="dash-funnel-step">{i + 1}</span><span>{stage.stage}</span></div>
                <div className="dash-funnel-bar-wrap">
                  <div className="dash-funnel-bar" style={{ width: `${stage.pct}%`, background: stage.pct > 70 ? '#4DB6AC' : stage.pct > 40 ? '#EA9228' : '#EF5350' }} />
                </div>
                <div className="dash-funnel-nums">
                  <span className="dash-funnel-count">{stage.users}</span>
                  <span className="muted dash-funnel-pct">{stage.pct}%</span>
                </div>
              </div>
            ))}
          </Card>
          <Card className="info-card"><h4 style={{ marginBottom: '0.5rem' }}>💡 Ключевые точки отвала</h4><p className="muted">Между 2-й и 3-й игрой теряется 32% — добавьте «Челлендж недели» или стрик-бонус. После 3-й игры только 23% сканируют QR — проверьте видимость кода на упаковке.</p></Card>
        </div>
      )}

      {/* ── AI Insights ── */}
      {tab === 'AI Insights' && (
        <div className="dash-section stack">

          {/* Generator card */}
          <Card style={{ background: 'linear-gradient(135deg, rgba(126,87,194,0.12), rgba(234,146,40,0.1))', border: '1.5px solid rgba(234,146,40,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h3 className="section-title" style={{ color: '#EA9228', margin: '0 0 0.25rem' }}>✨ AI-рекомендации</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                  {useStatic ? 'Статические · нажми для генерации через GPT-4o-mini' : 'Сгенерировано GPT-4o-mini · на основе реальных данных'}
                </p>
              </div>
              <button
                onClick={generateInsights}
                disabled={aiLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.55rem 1.1rem', borderRadius: '10px', border: 'none',
                  background: aiLoading ? 'rgba(234,146,40,0.3)' : 'linear-gradient(135deg, #EA9228, #c97212)',
                  color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'opacity 0.15s', fontFamily: 'inherit',
                }}
              >
                {aiLoading
                  ? <><span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'dash-spin 0.7s linear infinite' }} /> Генерирую...</>
                  : '⚡ Regenerate AI'}
              </button>
            </div>
            {aiError && <p style={{ color: '#EF5350', fontSize: '0.78rem', marginTop: '0.5rem', marginBottom: 0 }}>{aiError}</p>}
          </Card>

          <style>{`@keyframes dash-spin { to { transform: rotate(360deg); } }`}</style>

          {/* Insights list */}
          {useStatic
            ? staticInsights.map((insight) => (
                <Card key={insight.title} className="stack ai-insight-card" style={{ borderLeft: `4px solid ${insight.color}` }}>
                  <div className="ai-insight-head">
                    <span className="ai-insight-icon" style={{ background: insight.color + '20' }}>{insight.icon}</span>
                    <div>
                      <div className="ai-insight-tag" style={{ color: insight.color }}>{insight.tag}</div>
                      <h4 className="ai-insight-title">{insight.title}</h4>
                    </div>
                  </div>
                  <p className="muted ai-insight-text">{insight.text}</p>
                </Card>
              ))
            : aiLoading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} style={{ opacity: 0.4 + i * 0.1, animation: 'dash-spin 0s' }}>
                    <div style={{ height: '80px', background: 'rgba(126,87,194,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="muted">Анализирую данные...</span>
                    </div>
                  </Card>
                ))
              : aiInsightBlocks.map((block, i) => (
                  <AIInsightCard key={i} text={block} index={i} />
                ))
          }
        </div>
      )}

    </section>
  );
}

export default AnalyticsDashboard;
