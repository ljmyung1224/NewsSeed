"use client";

import { useState } from "react";
import Link from "next/link";
import type { TreeShopItem } from "@/lib/tree-shop";
import { equipTreeItems, itemState, purchaseTreeItem, treeShopItems } from "@/lib/tree-shop";
import { getTreeGrowth } from "@/lib/growth";
import { useTreeState } from "@/features/tree/use-tree-state";

const groups = [{ id: "pot", name: "화분" }, { id: "decoration", name: "장식" }, { id: "background", name: "배경" }, { id: "friend", name: "친구" }] as const;

export default function TreeShopPage() {
  const { state, updateStats, ready } = useTreeState();
  const [selected, setSelected] = useState<TreeShopItem | null>(null);
  const [message, setMessage] = useState("");
  if (!ready || !state) return <ShopLoading/>;
  const selectedStatus = selected ? itemState(state.stats, selected) : null;
  const buy = () => {
    if (!selected) return;
    const result = purchaseTreeItem(state.stats, selected);
    if (!result.ok) { setMessage(result.reason === "insufficient" ? "잎사귀가 조금 부족해요 🍃" : result.reason === "locked" ? `${getTreeGrowth(selected.minXp).stage.name}부터 열려요 🔒` : "이미 가지고 있는 아이템이에요."); return; }
    updateStats(() => result.stats);
    setMessage(`${selected.name}을(를) 얻었어요!`);
  };
  const equip = () => {
    if (!selected) return;
    updateStats(stats => equipTreeItems(stats, { ...stats.equippedTreeItems, [selected.category]: selected.id }));
    setMessage(`${selected.name}을(를) 장착했어요!`);
  };
  return <main className="min-h-dvh bg-[var(--cream)] px-5 pb-16"><header className="mx-auto flex h-20 max-w-[1050px] items-center justify-between"><Link href="/tree" className="font-black text-[var(--green-deep)]">← 지식나무</Link><span className="rounded-full bg-white px-4 py-2 font-black shadow-sm">🍃 {state.stats.leafCurrency}</span></header><div className="mx-auto max-w-[1050px]"><p className="eyebrow">TREE SHOP</p><h1 className="type-display mt-2 text-4xl">나무 상점 🍃</h1><p className="mt-3 text-[var(--muted)]">모은 잎사귀로 나만의 지식나무를 꾸며보세요.</p>{groups.map(group => <section key={group.id} className="mt-8"><h2 className="type-display text-2xl">{group.name}</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{treeShopItems.filter(item => item.category === group.id).map(item => { const status = itemState(state.stats, item); return <button key={item.id} onClick={() => { setSelected(item); setMessage(""); }} className={`card p-5 text-left transition hover:-translate-y-0.5 ${status === "equipped" ? "ring-2 ring-[var(--green)]" : ""}`}><span className="text-3xl">{item.preview}</span><h3 className="mt-3 font-black">{item.name}</h3><p className="mt-1 text-sm font-bold text-[var(--muted)]">{status === "locked" ? `🔒 ${getTreeGrowth(item.minXp).stage.name}부터` : status === "equipped" ? "장착 중" : status === "owned" ? "보유 중" : item.price ? `🍃 ${item.price}` : "무료"}</p></button>; })}</div></section>)}</div>{selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[#10281d]/55 px-5"><section className="card w-full max-w-sm p-6 text-center"><span className="text-5xl">{selected.preview}</span><h2 className="type-display mt-3 text-2xl">{selected.name}</h2><p className="mt-2 font-black text-[var(--green)]">{selected.price ? `🍃 ${selected.price}` : "무료"}</p>{message && <p className="mt-3 rounded-xl bg-[var(--green-soft)] p-3 text-sm font-bold">{message}</p>}<div className="mt-5 grid grid-cols-2 gap-3"><button className="btn-secondary" onClick={() => setSelected(null)}>닫기</button>{selectedStatus === "owned" ? <button className="btn-primary" onClick={equip}>바로 장착</button> : selectedStatus === "equipped" ? <button className="btn-primary" onClick={() => setSelected(null)}>장착 완료</button> : <button className="btn-primary" onClick={buy}>구매</button>}</div></section></div>}</main>;
}

function ShopLoading() { return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><p className="font-bold text-[var(--muted)]">상점을 불러오는 중...</p></div>; }
