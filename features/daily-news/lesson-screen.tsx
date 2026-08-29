"use client";

import { useState } from "react";
import type { Article } from "@/types";
import { ArrowIcon, BackIcon, BookIcon, CheckIcon, ClockIcon, CloseIcon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { SproutLogo } from "@/components/brand";

type VocabularyItem = Article["kidContent"]["vocabulary"][number];

export function LessonScreen({ article, index, total, onBack, onComplete }: { article: Article; index: number; total: number; onBack: () => void; onComplete: () => void }) {
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const [vocab, setVocab] = useState<VocabularyItem | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const question = article.kidContent.quiz[0];
  const correct = selected === question.answer;

  const submit = () => {
    if (selected === null) return;
    if (!checked) return setChecked(true);
    if (!correct) { setChecked(false); setSelected(null); return; }
    return onComplete();
  };

  const lessonProgress = phase === "read" ? 0.25 : 0.95;

  return <main className="min-h-dvh bg-[var(--cream)] pb-28">
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[860px] items-center gap-3"><button onClick={onBack} className="icon-btn" aria-label="뒤로"><BackIcon/></button><div className="flex-1"><ProgressBar value={((index + lessonProgress) / total) * 100}/></div><span className="whitespace-nowrap text-xs font-extrabold text-[var(--muted)]">{index + 1} / {total}</span><div className="hidden sm:block"><SproutLogo compact/></div></div></header>
    <article className="mx-auto max-w-[760px] px-5 pt-7 sm:pt-10">
      {process.env.NODE_ENV === "development" && <DevArticleMeta article={article}/>}
      {phase === "read" ? <div className="animate-rise">
        <div className="mb-5 flex items-center justify-between"><span className="rounded-full px-3 py-1.5 text-xs font-black" style={{ backgroundColor: `${article.color}18`, color: article.color }}>{article.emoji} {article.category}</span><span className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)]"><ClockIcon size={15}/>{article.estimatedReadingTime}분</span></div>
        <h1 className="type-display text-[32px] leading-[1.36] sm:text-[42px]">{article.kidContent.title}</h1>
        <section className="mt-9"><p className="eyebrow">차근차근 읽어요</p><h2 className="mt-1 text-xl font-black sm:text-2xl">쉬운 설명</h2><div className="article-copy mt-5 text-[#344139]">{article.kidContent.easyExplanation.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{renderVocabulary(paragraph, article.kidContent.vocabulary, setVocab)}</p>)}</div></section>
        <section className="mt-10 rounded-[24px] bg-[#eef5ff] p-5 sm:p-7"><p className="text-sm font-black text-[#4c72ad]">생각을 한 뼘 더</p><h2 className="mt-1 text-xl font-black">왜 중요할까요?</h2><div className="article-support-copy mt-4 space-y-4 text-[#39495d]">{article.kidContent.whyItMatters.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{renderVocabulary(paragraph, article.kidContent.vocabulary, setVocab)}</p>)}</div></section>
        <section className="mt-7 rounded-[22px] border border-[var(--line)] bg-white p-5 sm:p-6"><div className="flex items-center gap-2 font-black"><BookIcon size={19} className="text-[var(--green)]"/>어려운 단어</div><p className="mt-1 text-xs text-[var(--muted)]">단어를 눌러 어린이용 설명을 읽어 보세요.</p><div className="mt-4 flex flex-wrap gap-2">{article.kidContent.vocabulary.map(item => <button key={item.word} onClick={() => setVocab(item)} className="rounded-xl bg-[var(--green-soft)] px-3 py-2 text-sm font-extrabold text-[var(--green-deep)] transition hover:bg-[#d7f1da] active:scale-[.97]">{item.word}</button>)}</div></section>
        <blockquote className="article-support-copy my-7 rounded-[22px] border-l-4 border-[var(--green)] bg-[var(--green-soft)] p-5 font-bold text-[var(--green-deep)] sm:p-6"><span className="mb-2 block text-sm font-black">오늘의 한 줄 🌱</span>{article.kidContent.keyTakeaway}</blockquote>
        <button onClick={() => { setPhase("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-primary mt-7 w-full">퀴즈로 확인하기 <ArrowIcon size={18}/></button>
      </div> : <div className="animate-rise">
        <div className="text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-[#fff3d9] text-4xl">🧠</span><p className="eyebrow mt-5">생각 씨앗 확인</p><h1 className="mt-2 text-[27px] font-black tracking-[-0.04em] sm:text-3xl">기사를 잘 이해했나요?</h1></div>
        <section className="card mt-7 p-5 sm:p-8"><p className="text-xs font-black text-[var(--green)]">Q1 / 1</p><h2 className="mt-2 text-xl font-black leading-relaxed">{question.question}</h2><div className="mt-6 space-y-3">{question.options.map((option, optionIndex) => { const isAnswer = optionIndex === question.answer; const optionState = checked ? isAnswer ? "correct" : selected === optionIndex ? "wrong" : "" : selected === optionIndex ? "selected" : ""; return <button disabled={checked} key={`${question.id}-${optionIndex}`} onClick={() => setSelected(optionIndex)} className={`quiz-option ${optionState}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-current text-xs font-black">{String.fromCharCode(65 + optionIndex)}</span><span className="flex-1">{option}</span>{checked && isAnswer && <CheckIcon size={20}/>}</button>; })}</div>
          {checked && <div className={`mt-5 animate-pop rounded-2xl p-4 ${correct ? "bg-[var(--green-soft)] text-[var(--green-deep)]" : "bg-[#fff0ec] text-[#9e432f]"}`}><p className="font-black">{correct ? "정답이에요! 생각 씨앗이 자랐어요 🌱" : "조금 아쉬워요. 설명을 읽고 다시 생각해 볼까요?"}</p><p className="mt-1 text-sm font-medium leading-relaxed">{question.explanation}</p></div>}
        </section>
        <button disabled={selected === null} onClick={submit} className="btn-primary mt-5 w-full">{checked ? correct ? "다음 기사로" : "다시 풀기" : "정답 확인하기"}{checked && correct && <ArrowIcon size={18}/>}</button>
        <SourcePanel article={article}/>
      </div>}
    </article>
    {vocab && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#13271d]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onClick={() => setVocab(null)}><div role="dialog" aria-modal="true" onClick={event => event.stopPropagation()} className="w-full max-w-md animate-sheet rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px]"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--green-soft)] text-2xl">📖</span><button onClick={() => setVocab(null)} className="icon-btn" aria-label="단어 설명 닫기"><CloseIcon size={20}/></button></div><p className="eyebrow mt-5">쉬운 단어 뜻</p><h2 className="mt-1 text-2xl font-black">{vocab.word}</h2><p className="mt-3 whitespace-pre-line text-[16px] font-medium leading-relaxed text-[var(--muted)]">{vocab.meaning}</p><button onClick={() => setVocab(null)} className="btn-primary mt-6 w-full">이해했어요</button></div></div>}
  </main>;
}

function DevArticleMeta({ article }: { article: Article }) {
  return <aside className="mb-5 rounded-2xl border border-dashed border-[#aebbb2] bg-white/80 p-4 text-xs text-[#526158]">
    <div className="flex items-center justify-between gap-3"><b className={`rounded-full px-2.5 py-1 tracking-wide ${article.sourceType === "news-api" ? "bg-[#def3e3] text-[#17653a]" : "bg-[#fff0d8] text-[#8a5b12]"}`}>{article.sourceType === "news-api" ? "LIVE API" : "MOCK"}</b><span>DEV ONLY</span></div>
    {article.sourceType === "news-api" ? <dl className="mt-3 grid gap-1.5 sm:grid-cols-[110px_1fr]"><dt className="font-bold">원문 제목</dt><dd>{article.source.title}</dd><dt className="font-bold">언론사</dt><dd>{article.source.publisher}</dd><dt className="font-bold">발행일</dt><dd>{article.source.publishedAt}</dd><dt className="font-bold">카테고리</dt><dd>{article.category}</dd><dt className="font-bold">Gemini 변환</dt><dd>성공</dd><dt className="font-bold">원문 URL</dt><dd className="min-w-0 truncate"><a className="underline" href={article.source.url} target="_blank" rel="noopener noreferrer">{article.source.url}</a></dd></dl> : <p className="mt-3"><b>fallbackReason:</b> {article.fallbackReason ?? "unknown"}</p>}
  </aside>;
}

function renderVocabulary(text: string, vocabulary: VocabularyItem[], onClick: (item: VocabularyItem) => void) {
  const words = vocabulary.map(item => item.word).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!words.length) return text;
  const escapedWords = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escapedWords.join("|")})`, "g"));
  return parts.map((part, partIndex) => { const item = vocabulary.find(entry => entry.word === part); return item ? <button key={partIndex} onClick={() => onClick(item)} className="mx-0.5 rounded-md border-b-2 border-[var(--green)] bg-[var(--green-soft)] px-1 font-extrabold text-[var(--green-deep)] transition hover:bg-[#d2efd7]">{part}</button> : part; });
}

function SourcePanel({ article }: { article: Article }) {
  const date = new Date(article.source.publishedAt);
  const publishedAt = Number.isNaN(date.getTime()) ? article.source.publishedAt : new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  if (article.sourceType === "mock") return <aside className="mt-9 rounded-[20px] border border-dashed border-[var(--line)] bg-[#f8faf8] p-5"><p className="text-sm font-black text-[var(--ink)]">개발용 예시 기사</p><p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">실제 뉴스 연동 전 학습 경험을 확인하기 위해 뉴씨드가 작성한 콘텐츠입니다.</p></aside>;
  return <aside className="mt-9 rounded-[20px] border border-[var(--line)] bg-white p-5"><p className="text-sm font-bold leading-relaxed text-[var(--muted)]">이 콘텐츠는 실제 뉴스를 바탕으로 뉴씨드가 어린이 눈높이에 맞춰 재구성했습니다.</p><div className="mt-4 border-t border-[var(--line)] pt-4 text-sm"><p className="font-extrabold leading-relaxed">{article.source.title}</p><p className="mt-2"><b>출처 언론사:</b> {article.source.publisher}</p><p className="mt-1 text-[var(--muted)]"><b>발행일:</b> {publishedAt}</p>{article.source.url && <a href={article.source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex font-black text-[var(--green)] underline decoration-2 underline-offset-4">원문 기사 보기 ↗</a>}</div></aside>;
}
