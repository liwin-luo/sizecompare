/**
 * QuizGame — the "Which is bigger?" round island.
 *
 * Flow: intro → 10 questions → summary. During a question the canvas
 * draws both objects at EQUAL size (values hidden); answering plays the
 * reveal animation (equal → true proportions) before the verdict.
 * Keyboard: 1/2 to answer, Enter for the next question.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LIBRARY_BY_ID } from '../../data/library';
import {
  formatAttrValue,
  type AttributeKey,
} from '../../lib/attributes';
import {
  askPhrase,
  biggerSide,
  buildQuestionPool,
  buildShareText,
  parseQuizUrl,
  pickRound,
  quizPath,
  quizUrl,
  ROUND_SIZE,
  type QuizChallenge,
  type RoundQuestion,
} from '../../lib/quiz';
import type { ComparisonObject } from '../../lib/objects';
import { buildAnswerSentence } from '../tool/ScaleCanvas';
import { FamilyCanvas } from '../tool/FamilyCanvas';
import { track } from '../tool/track';
import { useReveal } from './useReveal';

type Phase = 'intro' | 'asking' | 'revealed' | 'summary';

const STORAGE_KEY = 'sizecompare:quiz:v1';
const BOX = { width: 760, height: 400 };

interface QuizStats {
  rounds: number;
  best: number;
}

function loadStats(): QuizStats {
  if (typeof window === 'undefined') return { rounds: 0, best: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rounds: 0, best: 0 };
    const parsed = JSON.parse(raw) as Partial<QuizStats>;
    return { rounds: Number(parsed.rounds) || 0, best: Number(parsed.best) || 0 };
  } catch {
    return { rounds: 0, best: 0 };
  }
}

interface Answered {
  q: RoundQuestion;
  picked: 'a' | 'b';
  correct: boolean;
}

export default function QuizGame() {
  const pool = useMemo(() => buildQuestionPool(), []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [seed, setSeed] = useState(1);
  const round = useMemo(() => pickRound(pool, seed), [pool, seed]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [stats, setStats] = useState<QuizStats>({ rounds: 0, best: 0 });
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<QuizChallenge | null>(null);

  useEffect(() => setStats(loadStats()), []);

  /* a shared ?s=..&b=.. link pins the round; the URL wins over defaults
     (stats live in localStorage and are not round state, so no conflict) */
  useEffect(() => {
    const fromUrl = parseQuizUrl(window.location.search);
    if (fromUrl) {
      setSeed(fromUrl.seed);
      setChallenge(fromUrl);
    }
  }, []);

  const q = round[index];
  const revealing = phase === 'revealed';
  const progress = useReveal(revealing);
  const score = answers.filter((a) => a.correct).length;
  const roundOver = phase === 'summary';

  const objects = useMemo<ComparisonObject[]>(
    () =>
      q
        ? [
            { kind: 'library' as const, record: LIBRARY_BY_ID[q.leftId] },
            { kind: 'library' as const, record: LIBRARY_BY_ID[q.rightId] },
          ]
        : [],
    [q],
  );

  const startRound = useCallback((seedOverride?: number) => {
    const nextSeed = seedOverride ?? Math.floor(Math.random() * 2 ** 31);
    setSeed(nextSeed);
    if (seedOverride === undefined) setChallenge(null);
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setShareNote(null);
    setPhase('asking');
    // keep the seed in the URL so a refresh replays the same round and any
    // later share link points at it (replace, not push — no history noise)
    try {
      window.history.replaceState(null, '', quizPath(nextSeed));
    } catch {
      /* history unavailable — the round still works */
    }
    track('quiz_start', { size: ROUND_SIZE, challenge: seedOverride !== undefined });
  }, []);

  const choose = useCallback(
    (side: 'left' | 'right') => {
      if (phase !== 'asking' || !q) return;
      const leftIsA = q.leftId === q.aId;
      const answer: 'a' | 'b' = side === 'left' ? (leftIsA ? 'a' : 'b') : leftIsA ? 'b' : 'a';
      const correct = answer === biggerSide(q);
      setPicked(answer);
      setAnswers((prev) => [...prev, { q, picked: answer, correct }]);
      setPhase('revealed');
      track('quiz_answer', { correct, tier: q.tier, attr: q.attr });
    },
    [phase, q],
  );

  const next = useCallback(() => {
    if (phase !== 'revealed') return;
    if (index + 1 < round.length) {
      setIndex(index + 1);
      setPicked(null);
      setPhase('asking');
    } else {
      setPhase('summary');
      setStats((prev) => {
        const nextStats = {
          rounds: prev.rounds + 1,
          best: Math.max(prev.best, score),
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStats));
        } catch {
          /* storage unavailable — the round still works */
        }
        return nextStats;
      });
      track('quiz_round_end', { score, size: round.length });
    }
  }, [phase, index, round.length, score]);

  /* keyboard: 1/2 answer, Enter advances */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'asking') {
        if (e.key === '1') choose('left');
        if (e.key === '2') choose('right');
      } else if (phase === 'revealed' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, choose, next]);

  async function share() {
    const url = quizUrl(seed, score);
    const text = buildShareText(
      answers.map((a) => a.correct),
      score,
      url,
    );
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareNote('Copied to clipboard!');
      }
      track('quiz_share', { score, size: answers.length });
    } catch {
      /* share cancelled — nothing to do */
    }
  }

  if (phase === 'intro') {
    return (
      <div className="quiz-root">
        <div className="quiz-intro">
          {challenge && (
            <p className="quiz-challenge">
              🎯{' '}
              {challenge.beat !== null
                ? `You've been challenged — the same ${ROUND_SIZE} questions, score to beat: ${challenge.beat}/${ROUND_SIZE}`
                : `You've been challenged — the same ${ROUND_SIZE} questions as your friend`}
            </p>
          )}
          <p className="quiz-intro-copy">
            Ten questions. Two things drawn at equal size — guess which is bigger,
            then watch the canvas morph to the true, sourced proportions.
          </p>
          {stats.rounds > 0 && (
            <p className="quiz-best">
              Rounds played: {stats.rounds} · Best score: {stats.best}/{ROUND_SIZE}
            </p>
          )}
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => startRound(challenge?.seed)}
          >
            {challenge ? 'Accept the challenge' : 'Start the quiz'}
          </button>
        </div>
      </div>
    );
  }

  if (roundOver || !q) {
    return (
      <div className="quiz-root">
        <section className="quiz-summary" aria-live="polite">
          <h2>
            You scored {score} out of {ROUND_SIZE}
          </h2>
          <p className="quiz-best">
            {score === ROUND_SIZE
              ? 'Perfect round — nothing left to guess!'
              : score >= 7
                ? 'Strong size intuition.'
                : 'The true scales are humbling — go again?'}
            {stats.best > 0 ? ` Best: ${stats.best}/${ROUND_SIZE}.` : ''}
          </p>
          {challenge && challenge.beat !== null && (
            <p className="quiz-challenge-result">
              {score > challenge.beat
                ? '🏆 Challenge beaten — you topped their score!'
                : score === challenge.beat
                  ? `Challenge matched at ${challenge.beat}/${ROUND_SIZE} — someone has to break the tie.`
                  : `Challenge unbeaten — ${challenge.beat}/${ROUND_SIZE} was the score to beat.`}
            </p>
          )}
          <pre className="quiz-share-preview" aria-label="Share scorecard preview">
            {buildShareText(
              answers.map((a) => a.correct),
              score,
              quizUrl(seed, score),
            )
              .split('\n')
              .slice(0, 3)
              .join('\n')}
          </pre>
          <ul className="quiz-review">
            {answers.map((a, i) => {
              const objectsPair: ComparisonObject[] = [
                { kind: 'library', record: LIBRARY_BY_ID[a.q.aId] },
                { kind: 'library', record: LIBRARY_BY_ID[a.q.bId] },
              ];
              const sentence = buildAnswerSentence(objectsPair, a.q.attr, 'metric');
              const href = a.q.curated
                ? `/compare/${a.q.aId}-vs-${a.q.bId}/`
                : null;
              return (
                <li key={i} className={a.correct ? 'ok' : 'miss'}>
                  <span className="mark">{a.correct ? '✓' : '✗'}</span>
                  <span>
                    {href ? (
                      <a href={href}>{sentence ?? '—'}</a>
                    ) : (
                      (sentence ?? '—')
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="quiz-summary-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => startRound()}>
              Play again
            </button>
            <button type="button" className="btn btn-ghost" onClick={share}>
              Share score
            </button>
            {shareNote && <span className="quiz-share-note">{shareNote}</span>}
          </div>
          <p className="hint">
            Dig into any comparison in the <a href="/compare/">curated library</a> or
            <a href="/studio/"> build your own in the Studio</a>.
          </p>
        </section>
      </div>
    );
  }

  const leftName = LIBRARY_BY_ID[q.leftId].name;
  const rightName = LIBRARY_BY_ID[q.rightId].name;
  const leftIsA = q.leftId === q.aId;
  const correctSide = biggerSide(q);
  const leftState =
    phase === 'revealed'
      ? (leftIsA ? 'a' : 'b') === correctSide
        ? 'correct'
        : picked === (leftIsA ? 'a' : 'b')
          ? 'wrong'
          : 'dim'
      : '';
  const rightState =
    phase === 'revealed'
      ? (leftIsA ? 'b' : 'a') === correctSide
        ? 'correct'
        : picked === (leftIsA ? 'b' : 'a')
          ? 'wrong'
          : 'dim'
      : '';
  const lastAnswer = answers[answers.length - 1];
  const valueLeft = formatAttrValue(
    q.attr,
    LIBRARY_BY_ID[q.leftId].measurements[q.attr]!.value,
    'metric',
  );
  const valueRight = formatAttrValue(
    q.attr,
    LIBRARY_BY_ID[q.rightId].measurements[q.attr]!.value,
    'metric',
  );

  return (
    <div className="quiz-root">
      <div className="quiz-head">
        <span className="quiz-counter">
          Question {index + 1} of {ROUND_SIZE}
        </span>
        <span className={`quiz-tier ${q.tier}`}>{q.tier}</span>
        <span className="quiz-score">Score {score}</span>
      </div>

      <p className="quiz-question" key={`${seed}-${index}`}>
        {askPhrase(q.attr)}
      </p>

      <div className="quiz-canvas-card">
        <FamilyCanvas
          objects={objects}
          attr={q.attr}
          box={BOX}
          unitSystem="metric"
          showSources={false}
          reveal={progress}
        />
      </div>

      <div className="quiz-options">
        <button
          type="button"
          className={`quiz-opt ${leftState}`}
          onClick={() => choose('left')}
          disabled={phase !== 'asking'}
        >
          <span className="quiz-opt-key">A</span>
          <span className="quiz-opt-name">{leftName}</span>
          {phase === 'revealed' && <span className="quiz-opt-value">{valueLeft}</span>}
        </button>
        <button
          type="button"
          className={`quiz-opt ${rightState}`}
          onClick={() => choose('right')}
          disabled={phase !== 'asking'}
        >
          <span className="quiz-opt-key">B</span>
          <span className="quiz-opt-name">{rightName}</span>
          {phase === 'revealed' && <span className="quiz-opt-value">{valueRight}</span>}
        </button>
      </div>

      {phase === 'revealed' && progress >= 1 && (
        <div className="quiz-verdict" aria-live="polite">
          <p className={lastAnswer?.correct ? 'good' : 'bad'}>
            {lastAnswer?.correct ? 'Correct!' : 'Not quite —'}
          </p>
          <p className="quiz-answer-line">
            {buildAnswerSentence(objects, q.attr as AttributeKey, 'metric')}
          </p>
          <button type="button" className="btn btn-primary" onClick={next} autoFocus>
            {index + 1 < round.length ? 'Next question →' : 'See results →'}
          </button>
          <p className="hint">or press Enter</p>
        </div>
      )}
    </div>
  );
}
