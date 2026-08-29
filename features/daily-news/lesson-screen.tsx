"use client";

import { useState } from "react";
import type { Article } from "@/types";
import { ArrowIcon, BackIcon, BookIcon, CheckIcon, ClockIcon, CloseIcon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { SproutLogo } from "@/components/brand";

export function LessonScreen({ article, index, total, onBack, onComplete }: { article: Article; index: number; total: number; onBack: () => void; onComplete: () => void }) {
  const [phase, setPhase] = useState<"read"|"quiz">("read");
  const [vocab, setVocab] = useState<Article["kidContent"]["vocabulary"][number] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const question = article.kidContent.quiz[0];
  const correct = selected === question.answer;
  const submit = () => { if (selected === null) return; if (!checked) setChecked(true); else if (correct) onComplete(); else { setChecked(false); setSelected(null); } };

  return <main className="min-h-dvh bg-[var(--cream)] pb-28">
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[860px] items-center gap-3"><button onClick={onBack} className="icon-btn" aria-label="홈으로"><BackIcon/></button><div className="flex-1"><ProgressBar value={((index + (phase === "quiz" ? .75 : .2)) / total) * 100}/></div><span className="whitespace-nowrap text-xs font-extrabold text-[var(--muted)]">{index+1} / {total}</span><div className="hidden sm:block"><SproutLogo compact/></div></div></header>
    <article className="mx-auto max-w-[760px] px-5 pt-7 sm:pt-10">
      {phase === "read" ? <div className="animate-rise">
        <div className="mb-5 flex items-center justify-between"><span className="rounded-full px-3 py-1.5 text-xs font-black" style={{backgroundColor:`${article.color}18`,color:article.color}}>{article.emoji} {article.category}</span><span className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]"><ClockIcon size={15}/>{article.estimatedReadingTime}분</span></div>
        <h1 className="text-[30px] font-black leading-[1.25] tracking-[-0.045em] sm:text-[40px]">{article.kidContent.title}</h1><p className="mt-4 text-[16px] font-medium leading-relaxed text-[var(--muted)] sm:text-lg">{article.kidContent.summary}</p>
        <div className="my-7 h-px bg-[var(--line)]"/>
        <div className="space-y-6 text-[17px] font-medium leading-[1.9] text-[#344139] sm:text-[18px]">{article.kidContent.content.map((paragraph,i)=><p key={i}>{renderVocabulary(paragraph, article.kidContent.vocabulary, setVocab)}</p>)}</div>
        <blockquote className="my-8 rounded-[22px] border-l-4 border-[var(--green)] bg-[var(--green-soft)] p-5 text-[17px] font-extrabold leading-relaxed text-[var(--green-deep)] sm:p-6"><span className="mb-2 block text-sm">🌱 한 줄 씨앗</span>{article.kidContent.highlight}</blockquote>
        <div className="rounded-[22px] border border-[var(--line)] bg-white p-5"><div className="flex items-center gap-2 font-black"><BookIcon size={19} className="text-[var(--green)]"/>오늘의 낱말</div><p className="mt-1 text-xs text-[var(--muted)]">초록색 낱말을 눌러 뜻을 확인해 보세요.</p><div className="mt-4 flex flex-wrap gap-2">{article.kidContent.vocabulary.map(item=><button key={item.word} onClick={()=>setVocab(item)} className="rounded-xl bg-[var(--green-soft)] px-3 py-2 text-sm font-extrabold text-[var(--green-deep)] transition hover:bg-[#d7f1da]">{item.word}</button>)}</div></div>
        <SourcePanel article={article}/>
        <button onClick={()=>{setPhase("quiz");window.scrollTo({top:0,behavior:"smooth"})}} className="btn-primary mt-7 w-full">내용을 다 읽었어요 <ArrowIcon size={18}/></button>
      </div> : <div className="animate-rise">
        <div className="text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-[#fff3d9] text-4xl">🧠</span><p className="eyebrow mt-5">생각 씨앗 퀴즈</p><h1 className="mt-2 text-[27px] font-black tracking-[-0.04em] sm:text-3xl">기사를 잘 이해했나요?</h1></div>
        <section className="card mt-7 p-5 sm:p-8"><p className="text-xs font-black text-[var(--green)]">Q1</p><h2 className="mt-2 text-xl font-black leading-relaxed">{question.question}</h2><div className="mt-6 space-y-3">{question.options.map((option,optionIndex)=>{const isAnswer=optionIndex===question.answer; const state=checked ? isAnswer ? "correct" : selected===optionIndex ? "wrong" : "" : selected===optionIndex ? "selected" : ""; return <button disabled={checked} key={option} onClick={()=>setSelected(optionIndex)} className={`quiz-option ${state}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-current text-xs font-black">{String.fromCharCode(65+optionIndex)}</span><span className="flex-1">{option}</span>{checked&&isAnswer&&<CheckIcon size={20}/>}</button>})}</div>
          {checked && <div className={`mt-5 rounded-2xl p-4 animate-pop ${correct?"bg-[var(--green-soft)] text-[var(--green-deep)]":"bg-[#fff0ec] text-[#9e432f]"}`}><p className="font-black">{correct ? "정답이에요! 씨앗이 쑥 자랐어요 🌱" : "조금 아쉬워요. 다시 생각해 볼까요?"}</p><p className="mt-1 text-sm font-medium leading-relaxed">{question.explanation}</p></div>}
        </section>
        <button disabled={selected===null} onClick={submit} className={`mt-5 w-full ${checked&&correct?"btn-primary":"btn-primary"}`}>{checked ? correct ? "다음 씨앗으로" : "다시 풀기" : "정답 확인하기"}{checked&&correct&&<ArrowIcon size={18}/>}</button>
      </div>}
    </article>
    {vocab && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#13271d]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onClick={()=>setVocab(null)}><div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} className="w-full max-w-md animate-sheet rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--green-soft)] text-2xl">📖</span><button onClick={()=>setVocab(null)} className="icon-btn"><CloseIcon size={20}/></button></div><p className="eyebrow mt-5">쉬운 낱말 풀이</p><h2 className="mt-1 text-2xl font-black">{vocab.word}</h2><p className="mt-3 text-[16px] font-medium leading-relaxed text-[var(--muted)]">{vocab.meaning}</p><button onClick={()=>setVocab(null)} className="btn-primary mt-6 w-full">이해했어요</button></div></div>}
  </main>;
}

function renderVocabulary(text: string, vocabulary: Article["kidContent"]["vocabulary"], onClick: (item: Article["kidContent"]["vocabulary"][number])=>void) {
  const words = vocabulary.map(item=>item.word); const parts=text.split(new RegExp(`(${words.join("|")})`,"g"));
  return parts.map((part,index)=>{const item=vocabulary.find(v=>v.word===part); return item?<button key={index} onClick={()=>onClick(item)} className="mx-0.5 rounded-md border-b-2 border-[var(--green)] bg-[var(--green-soft)] px-1 font-extrabold text-[var(--green-deep)] transition hover:bg-[#d2efd7]">{part}</button>:part});
}

function SourcePanel({ article }: { article: Article }) {
  const publishedAt = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(`${article.source.publishedAt.slice(0, 10)}T12:00:00`));
  if (article.sourceType === "mock") return <aside className="mt-5 rounded-[20px] border border-dashed border-[var(--line)] bg-[#f8faf8] p-5"><p className="text-sm font-black text-[var(--ink)]">개발용 예시 기사</p><p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">실제 뉴스 API 연동 전 학습 경험을 확인하기 위해 뉴씨드가 작성한 콘텐츠입니다.</p></aside>;
  return <aside className="mt-5 rounded-[20px] border border-[var(--line)] bg-white p-5"><p className="text-sm font-bold leading-relaxed text-[var(--muted)]">이 콘텐츠는 실제 뉴스를 바탕으로 뉴씨드가 어린이 눈높이에 맞춰 새롭게 구성했습니다.</p><div className="mt-4 border-t border-[var(--line)] pt-4 text-sm"><p className="font-extrabold leading-relaxed">{article.source.title}</p><p className="mt-2"><b>출처:</b> {article.source.publisher}</p><p className="mt-1 text-[var(--muted)]">{publishedAt}</p>{article.source.url && <a href={article.source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex font-black text-[var(--green)] underline decoration-2 underline-offset-4">원문 기사 보기 ↗</a>}</div></aside>;
}
