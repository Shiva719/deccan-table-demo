"use client";
import { useEffect, useRef, useState } from "react";
import { Brain, Grid3X3, Zap, RotateCcw } from "lucide-react";
import { shuffle, outcome, botMove, foodSymbols } from "@/lib/utils/domain";
function Memory() {
  const [deck, setDeck] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setDeck(shuffle([...foodSymbols, ...foodSymbols]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }
  useEffect(() => {
    const start = setTimeout(reset, 0);
    return () => {
      clearTimeout(start);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function flip(i: number) {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i))
      return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (deck[next[0]] === deck[i]) {
        setMatched((m) => [...m, ...next]);
        setFlipped([]);
      } else timer.current = setTimeout(() => setFlipped([]), 850);
    }
  }
  return (
    <>
      <div className="between">
        <h2>Food Memory Match</h2>
        <span className="score">Moves · {moves}</span>
      </div>
      <p>Flip two tiles and find all six delicious pairs.</p>
      <div className="memory-grid">
        {deck.map((s, i) => (
          <button
            key={i}
            className={
              matched.includes(i)
                ? "matched"
                : flipped.includes(i)
                  ? "flipped"
                  : ""
            }
            disabled={
              matched.includes(i) || flipped.includes(i) || flipped.length === 2
            }
            aria-label={
              flipped.includes(i) || matched.includes(i)
                ? "Food " + s
                : "Hidden tile " + (i + 1)
            }
            onClick={() => flip(i)}
          >
            {flipped.includes(i) || matched.includes(i) ? s : "✦"}
          </button>
        ))}
      </div>
      <p role="status">
        {matched.length === 12
          ? "Brilliant! All six pairs in " + moves + " moves!"
          : "Ready, set, match!"}
      </p>
      <button className="button soft" onClick={reset}>
        <RotateCcw size={16} />
        Shuffle & play again
      </button>
    </>
  );
}
function Tic() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [wins, setWins] = useState(0);
  const result = outcome(board);
  function move(i: number) {
    if (board[i] || result) return;
    const b = [...board];
    b[i] = "X";
    if (outcome(b) === "X") setWins((w) => w + 1);
    if (!outcome(b)) {
      const pick = botMove(b);
      if (pick !== undefined) b[pick] = "O";
    }
    setBoard(b);
  }
  return (
    <>
      <div className="between">
        <h2>Tic-Tac-Toe</h2>
        <span className="score">Your wins · {wins}</span>
      </div>
      <p>You are X. The computer is O. Make a line of three.</p>
      <div className="tic-board">
        {board.map((v, i) => (
          <button
            key={i}
            disabled={!!v || !!result}
            aria-label={"Square " + (i + 1) + (v ? " " + v : "")}
            onClick={() => move(i)}
          >
            {v}
          </button>
        ))}
      </div>
      <p role="status">
        {result === "X"
          ? "You won this round!"
          : result === "O"
            ? "The computer won. Try again!"
            : result === "draw"
              ? "It’s a draw · well played!"
              : "Your turn · choose a square."}
      </p>
      <button
        className="button soft"
        onClick={() => setBoard(Array(9).fill(""))}
      >
        <RotateCcw size={16} />
        New round
      </button>
    </>
  );
}
function Reflex() {
  const [phase, setPhase] = useState("idle");
  const [results, setResults] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const go = useRef(0);
  const livePhase = useRef("idle");
  function change(p: string) {
    livePhase.current = p;
    setPhase(p);
  }
  function start() {
    if (timer.current) clearTimeout(timer.current);
    change("waiting");
    timer.current = setTimeout(
      () => {
        go.current = performance.now();
        change("go");
      },
      1200 + Math.random() * 2400,
    );
  }
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function tap() {
    if (livePhase.current === "waiting") {
      if (timer.current) clearTimeout(timer.current);
      change("early");
    } else if (livePhase.current === "go") {
      setResults((r) => [...r, Math.round(performance.now() - go.current)]);
      change("done");
    }
  }
  return (
    <>
      <div className="between">
        <h2>Quick Reflex</h2>
        <span className="score">
          Best · {results.length ? Math.min(...results) + " ms" : "—"}
        </span>
      </div>
      <p>Wait for green, then tap as fast as you can.</p>
      <button className={"tap-zone " + phase} onClick={tap}>
        {phase === "waiting"
          ? "Wait for GREEN…"
          : phase === "go"
            ? "TAP NOW!"
            : phase === "early"
              ? "Too soon! Wait for green."
              : phase === "done"
                ? results.at(-1) + " ms"
                : "Ready when you are."}
      </button>
      <div className="between">
        <p>
          Last: {results.at(-1) ?? "—"}
          {results.length ? " ms" : ""}
        </p>
        <p>
          Average:{" "}
          {results.length
            ? Math.round(results.reduce((s, v) => s + v, 0) / results.length) +
              " ms"
            : "—"}
        </p>
      </div>
      <div className="actions">
        <button className="button" onClick={start}>
          Start challenge
        </button>
        <button
          className="button soft"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            change("idle");
            setResults([]);
          }}
        >
          Reset
        </button>
      </div>
    </>
  );
}
export function Games() {
  const [game, setGame] = useState("memory");
  return (
    <section className="games">
      <div className="section-heading">
        <div>
          <p className="eyebrow">A LITTLE MOMENT FOR YOU</p>
          <h2>Choose your little break.</h2>
          <p>Three tiny challenges. One delicious way to pass the time.</p>
        </div>
      </div>
      <div className="game-layout">
        <nav className="game-picker" aria-label="Choose a game">
          {[
            {
              id: "memory",
              name: "Food Match",
              sub: "Find the pairs",
              icon: Brain,
            },
            {
              id: "tic",
              name: "Tic-Tac-Toe",
              sub: "Beat the bot",
              icon: Grid3X3,
            },
            {
              id: "reflex",
              name: "Quick Reflex",
              sub: "Test your speed",
              icon: Zap,
            },
          ].map((g) => (
            <button
              key={g.id}
              aria-pressed={game === g.id}
              className={game === g.id ? "active" : ""}
              onClick={() => setGame(g.id)}
            >
              <g.icon size={24} />
              <span>
                <strong>{g.name}</strong>
                <small>{g.sub}</small>
              </span>
              <span>→</span>
            </button>
          ))}
        </nav>
        <div className="panel game-panel">
          <div hidden={game !== "memory"}>
            <Memory />
          </div>
          <div hidden={game !== "tic"}>
            <Tic />
          </div>
          <div hidden={game !== "reflex"}>
            <Reflex />
          </div>
        </div>
      </div>
    </section>
  );
}
