import type { LearningStats, SeedRecord } from "@/types";
import { getCategorySeedCounts, getMissionProgress, getTreeGrowth, missionDefinitions } from "@/lib/growth";
import { TODAY } from "@/lib/date";
import Link from "next/link";
import { TreePreview } from "@/components/tree-preview";

const categoryEmoji: Record<string, string> = { 경제: "💰", 과학: "🔬", 사회: "🏘️", 국제: "🌏", 환경: "🌱", 문화: "🎨", 스포츠: "⚽", 기술: "💻", 동물: "🐾", 우주: "🚀" };

export function KnowledgeTreeCard({ stats }: { stats: LearningStats }) {
  const { stage, next, progress, customizationUnlocked } = getTreeGrowth(stats.xp);
  return <Link href="/tree" className="card block p-4 transition hover:-translate-y-0.5 sm:p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold tracking-[0.12em] text-[var(--green)]">KNOWLEDGE TREE</p><h2 className="type-display mt-0.5 text-xl">나의 지식나무</h2></div><div className="w-20"><TreePreview xp={stats.xp} equipped={stats.equippedTreeItems} compact/></div></div><div className="mt-3 flex items-end justify-between"><div><p className="text-lg font-black text-[var(--green-deep)]">{stage.name}</p><p className="text-[11px] font-bold text-[var(--muted)]">{next ? `${next.name}까지 ${next.minXp - stats.xp} XP` : "지식나무가 완전히 자랐어요!"}</p></div><strong className="text-xs text-[var(--green)]">{stats.xp} XP · 🍃 {stats.leafCurrency}</strong></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e8efe9]"><div className="h-full rounded-full bg-gradient-to-r from-[#63c65c] to-[#2faa59] transition-all" style={{ width: `${progress}%` }}/></div><p className="mt-2 text-[11px] font-black text-[var(--muted)]">{customizationUnlocked ? "나무 꾸미기 →" : `🔒 어린나무까지 ${Math.max(0, 300 - stats.xp)} XP`}</p></Link>;
}

export function DailyMissionCard({ stats, records }: { stats: LearningStats; records: SeedRecord[] }) {
  const progress = getMissionProgress(records, TODAY);
  const rewarded = stats.missionRewards[TODAY] ?? [];
  return <section className="card p-4 sm:p-5">
    <div className="flex items-center justify-between"><h2 className="type-display text-xl">오늘의 미션</h2><span className="rounded-full bg-[var(--green-soft)] px-2.5 py-1 text-[11px] font-black text-[var(--green)]">{rewarded.length}/3 완료</span></div>
    <div className="mt-3 space-y-2">{missionDefinitions.map(mission => {
      const done = rewarded.includes(mission.id);
      return <div key={mission.id} className={`rounded-xl border p-2.5 ${done ? "border-[#a9ddb5] bg-[#effaf1]" : "border-[var(--line)] bg-[#fafcfb]"}`}>
        <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-base shadow-sm">{done ? "✅" : mission.emoji}</span><div className="min-w-0 flex-1">
          <div className="flex justify-between gap-2"><p className="truncate text-xs font-black sm:text-sm">{mission.title}</p><span className="shrink-0 text-[11px] font-black text-[var(--green)]">+{mission.rewardXp} XP · +{mission.rewardLeaves} 🍃</span></div>
          <div className="mt-1.5 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5ebe7]"><div className="h-full rounded-full bg-[var(--green)]" style={{ width: `${Math.min(100, progress[mission.id] / mission.target * 100)}%` }}/></div><p className="text-[10px] font-bold text-[var(--muted)]">{progress[mission.id]}/{mission.target}</p></div>
        </div></div>
      </div>;
    })}</div>
  </section>;
}

export function CategorySeedCard({ records }: { records: SeedRecord[] }) {
  const counts = getCategorySeedCounts(records);
  const entries = Object.entries(counts).filter(([,count]) => count > 0).sort((a,b) => b[1] - a[1]);
  return <section className="card p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="type-display type-section">카테고리 씨앗</h2><span className="text-xs font-black text-[var(--green)]">총 {records.length}개</span></div>{entries.length ? <div className="mt-4 grid grid-cols-2 gap-2">{entries.map(([category,count])=><div key={category} className="flex items-center justify-between rounded-xl bg-[var(--green-soft)] px-3 py-2.5"><span className="text-sm font-black">{categoryEmoji[category]} {category}</span><strong className="text-sm text-[var(--green)]">{count}개</strong></div>)}</div> : <p className="mt-4 rounded-2xl bg-[#f6f8f6] p-4 text-center text-sm font-bold text-[var(--muted)]">기사를 읽으면 분야별 씨앗이 쌓여요.</p>}</section>;
}
