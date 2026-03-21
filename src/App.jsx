import { useEffect, useMemo, useState } from "react";
import {
  Blocks,
  House,
  Lightbulb,
  RefreshCw,
  Heart,
  WandSparkles,
  Trophy,
  Shield,
  Sword,
  Skull,
  ArrowRight
} from "lucide-react";
import "./App.css";

const MODULES = [
  { id: "place_build", label: "Base Diez", icon: "BD", cost: "1 PT" },
  { id: "place_split", label: "Descomponer", icon: "D10", cost: "1 PT" },
  { id: "sum", label: "Suma", icon: "+", cost: "1 PT" },
  { id: "sub", label: "Resta", icon: "-", cost: "1 PT" },
  { id: "mul", label: "Multiplicacion", icon: "x", cost: "2 PTS" },
  { id: "div", label: "Division", icon: "/", cost: "3 PTS" }
];

const DIFFICULTIES = [
  { id: "easy", label: "Pradera", enemy: "Limo", hp: 3, code: "slime" },
  { id: "medium", label: "Ruinas", enemy: "Murcielago", hp: 4, code: "bat" },
  { id: "hard", label: "Torre", enemy: "Golem", hp: 5, code: "golem" }
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function decompose(number) {
  return {
    hundreds: Math.floor(number / 100),
    tens: Math.floor((number % 100) / 10),
    ones: number % 10
  };
}

function buildDigitPool(correctString, extraCount = 3) {
  const digits = correctString.split("");
  const pool = [...digits];
  for (let i = 0; i < extraCount; i += 1) {
    pool.push(String(randomInt(0, 9)));
  }
  return shuffle(pool).map((value, index) => ({
    id: `${value}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    value
  }));
}

function buildChoicePool(correctValue, min = 1, max = 12, extraCount = 3) {
  const set = new Set([String(correctValue)]);
  while (set.size < extraCount + 1) {
    set.add(String(randomInt(min, max)));
  }
  return shuffle([...set]).map((value, index) => ({
    id: `${value}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    value
  }));
}

function levelRange(difficulty, module) {
  if (module === "place_build" || module === "place_split") {
    if (difficulty === "easy") return { min: 12, max: 98 };
    if (difficulty === "medium") return { min: 120, max: 498 };
    return { min: 320, max: 999 };
  }

  if (module === "mul") {
    if (difficulty === "easy") return { aMin: 2, aMax: 4, bMin: 2, bMax: 5 };
    if (difficulty === "medium") return { aMin: 3, aMax: 7, bMin: 2, bMax: 8 };
    return { aMin: 4, aMax: 9, bMin: 3, bMax: 9 };
  }

  if (module === "div") {
    if (difficulty === "easy") return { divisorMin: 2, divisorMax: 5, quotientMin: 2, quotientMax: 6 };
    if (difficulty === "medium") return { divisorMin: 2, divisorMax: 7, quotientMin: 3, quotientMax: 9 };
    return { divisorMin: 3, divisorMax: 9, quotientMin: 4, quotientMax: 12 };
  }

  if (difficulty === "easy") return { min: 10, max: 99 };
  if (difficulty === "medium") return { min: 80, max: 299 };
  return { min: 200, max: 999 };
}

function buildDivisionMissingTask(difficulty) {
  const { divisorMin, divisorMax, quotientMin, quotientMax } = levelRange(difficulty, "div");
  const divisor = randomInt(divisorMin, divisorMax);
  const quotient = randomInt(quotientMin, quotientMax);
  const dividend = divisor * quotient;

  const missingType = Math.random() < 0.5 ? "divisor" : "quotient";
  const correctValue = missingType === "divisor" ? divisor : quotient;

  const repeatedSubtract = missingType === "divisor" ? quotient : divisor;
  const totalRepeats = missingType === "divisor" ? divisor : quotient;

  const steps = [];
  let current = dividend;
  for (let i = 0; i < totalRepeats; i += 1) {
    const next = current - repeatedSubtract;
    steps.push({
      before: current,
      minus: repeatedSubtract,
      after: next
    });
    current = next;
  }

  const promptOperation =
    missingType === "divisor"
      ? `${dividend} / ? = ${quotient}`
      : `${dividend} / ${divisor} = ?`;

  const conclusion =
    missingType === "divisor"
      ? `Se resto ${quotient} un total de ${divisor} veces. Entonces ${dividend} / ${divisor} = ${quotient}.`
      : `Se resto ${divisor} un total de ${quotient} veces. Entonces ${dividend} / ${divisor} = ${quotient}.`;

  const hint =
    missingType === "divisor"
      ? `Cuenta cuantas veces puedes restar ${quotient} desde ${dividend} hasta llegar a 0.`
      : `Cuenta cuantas veces puedes restar ${divisor} desde ${dividend} hasta llegar a 0.`;

  return {
    type: "division-missing",
    module: "div",
    title: "Completa la division",
    prompt: "Arrastra el numero faltante para completar la division.",
    dividend,
    divisor,
    quotient,
    missingType,
    pool: buildChoicePool(correctValue, 1, Math.max(12, correctValue + 6), 4),
    steps,
    explanation: [
      `Operacion: ${promptOperation}`,
      `La division se entiende aqui como resta repetida.`,
      ...steps.map((s) => `${s.before} - ${s.minus} = ${s.after}`),
      conclusion
    ],
    hint,
    correctValue: String(correctValue)
  };
}

function buildOperationTask(module, difficulty) {
  if (module === "place_build") {
    const { min, max } = levelRange(difficulty, module);
    const number = randomInt(min, max);
    const base = decompose(number);

    return {
      type: "place-build",
      module,
      title: "Construye el numero",
      prompt: "Organiza centenas, decenas y unidades para formar el numero correcto.",
      number,
      base,
      explanation: [
        "Una centena vale 100.",
        "Una decena vale 10.",
        "Una unidad vale 1.",
        `${number} = ${base.hundreds} centenas + ${base.tens} decenas + ${base.ones} unidades.`
      ]
    };
  }

  if (module === "place_split") {
    const { min, max } = levelRange(difficulty, module);
    const number = randomInt(min, max);
    const base = decompose(number);

    return {
      type: "place-split",
      module,
      title: "Descompone el numero",
      prompt: "Observa el numero y escribe su descomposicion en centenas, decenas y unidades.",
      number,
      base,
      explanation: [
        "Descomponer es separar un numero por valor posicional.",
        `${number} tiene ${base.hundreds} centenas, ${base.tens} decenas y ${base.ones} unidades.`
      ]
    };
  }

  if (module === "sum") {
    const { min, max } = levelRange(difficulty, module);
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    const result = a + b;

    return {
      type: "drag-result",
      module,
      title: "Completa la suma",
      prompt: "Arrastra las cifras correctas al resultado.",
      a,
      b,
      symbol: "+",
      result,
      resultString: String(result),
      pool: buildDigitPool(String(result), 4),
      explanation: [
        "Sumar significa juntar cantidades.",
        `${a} + ${b} = ${result}.`
      ]
    };
  }

  if (module === "sub") {
    const { min, max } = levelRange(difficulty, module);
    const a = randomInt(min, max);
    const b = randomInt(min, Math.max(min, a - 1));
    const result = a - b;

    return {
      type: "drag-result",
      module,
      title: "Completa la resta",
      prompt: "Arrastra las cifras correctas al resultado.",
      a,
      b,
      symbol: "-",
      result,
      resultString: String(result),
      pool: buildDigitPool(String(result), 4),
      explanation: [
        "Restar significa quitar cantidades.",
        `${a} - ${b} = ${result}.`
      ]
    };
  }

  if (module === "mul") {
    const { aMin, aMax, bMin, bMax } = levelRange(difficulty, module);
    const a = randomInt(aMin, aMax);
    const b = randomInt(bMin, bMax);
    const result = a * b;

    return {
      type: "drag-result",
      module,
      title: "Completa la multiplicacion",
      prompt: "Arrastra las cifras correctas al resultado.",
      a,
      b,
      symbol: "x",
      result,
      resultString: String(result),
      pool: buildDigitPool(String(result), 4),
      explanation: [
        "Multiplicar significa repetir grupos iguales.",
        `${a} x ${b} = ${result}.`
      ]
    };
  }

  return buildDivisionMissingTask(difficulty);
}

function BaseTenBoard({ hundreds = 0, tens = 0, ones = 0, compact = false }) {
  return (
    <div className={`base-ten-board ${compact ? "compact" : ""}`}>
      <div className="place-column">
        <span className="place-title">C</span>
        <div className="place-stack">
          {Array.from({ length: hundreds }).map((_, i) => (
            <div key={i} className="hundred-pixel">
              {Array.from({ length: 10 }).map((_, row) => (
                <div key={row} className="hundred-row">
                  {Array.from({ length: 10 }).map((_, col) => (
                    <span key={col} className="mini-pixel" />
                  ))}
                </div>
              ))}
            </div>
          ))}
          {hundreds === 0 ? <span className="zero-tag">0</span> : null}
        </div>
      </div>

      <div className="place-column">
        <span className="place-title">D</span>
        <div className="place-stack">
          {Array.from({ length: tens }).map((_, i) => (
            <div key={i} className="ten-pixel">
              {Array.from({ length: 10 }).map((_, j) => (
                <span key={j} className="mini-pixel rod" />
              ))}
            </div>
          ))}
          {tens === 0 ? <span className="zero-tag">0</span> : null}
        </div>
      </div>

      <div className="place-column">
        <span className="place-title">U</span>
        <div className="units-cloud">
          {Array.from({ length: ones }).map((_, i) => (
            <span key={i} className="one-pixel" />
          ))}
          {ones === 0 ? <span className="zero-tag">0</span> : null}
        </div>
      </div>
    </div>
  );
}

function PixelButton({ children, className = "", ...props }) {
  return (
    <button className={`pixel-btn ${className}`} {...props}>
      {children}
    </button>
  );
}

function EnemySprite({ enemy, code, hp, hit }) {
  return (
    <div className={`sprite-card enemy ${hit ? "enemy-hit" : ""} enemy-${code}`}>
      <div className="sprite-label">{enemy}</div>

      <div className="enemy-wrap">
        {code === "slime" ? (
          <div className="enemy-art slime">
            <div className="slime-eye left"></div>
            <div className="slime-eye right"></div>
            <div className="slime-mouth"></div>
          </div>
        ) : null}

        {code === "bat" ? (
          <div className="enemy-art bat">
            <div className="bat-wing left"></div>
            <div className="bat-body"></div>
            <div className="bat-wing right"></div>
            <div className="bat-eye left"></div>
            <div className="bat-eye right"></div>
          </div>
        ) : null}

        {code === "golem" ? (
          <div className="enemy-art golem">
            <div className="golem-head">
              <div className="golem-eye left"></div>
              <div className="golem-eye right"></div>
            </div>
            <div className="golem-body"></div>
            <div className="golem-arm left"></div>
            <div className="golem-arm right"></div>
          </div>
        ) : null}

        <div className="enemy-shadow"></div>
      </div>

      <div className="hp-row">
        {Array.from({ length: hp }).map((_, i) => (
          <Heart key={i} className="mini-heart enemy-heart" size={16} />
        ))}
      </div>
    </div>
  );
}

function PlayerSprite({ hp, attack }) {
  return (
    <div className={`sprite-card player ${attack ? "capy-attack" : ""}`}>
      <div className="sprite-label">Capibara</div>

      <div className="capybara-wrap">
        <div className="capybara-body">
          <div className="capy-ear left"></div>
          <div className="capy-ear right"></div>

          <div className="capy-face-area">
            <div className="capy-eyes">
              <span></span>
              <span></span>
            </div>
            <div className="capy-nose"></div>
            <div className="capy-mouth"></div>
          </div>

          <div className="capy-leg front"></div>
          <div className="capy-leg back"></div>
        </div>

        <div className="capy-shadow"></div>
      </div>

      <div className="hp-row">
        {Array.from({ length: hp }).map((_, i) => (
          <Heart key={i} className="mini-heart" size={16} />
        ))}
      </div>
    </div>
  );
}

function DigitChip({ chip, onDragStart, disabled }) {
  return (
    <div
      className={`digit-chip ${disabled ? "used" : ""}`}
      draggable={!disabled}
      onDragStart={() => !disabled && onDragStart(chip)}
    >
      {chip.value}
    </div>
  );
}

function DropSlot({ value, onDrop, label, wide = false }) {
  return (
    <div
      className="drop-slot-wrap"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className={`drop-slot ${wide ? "wide" : ""}`}>{value ?? "?"}</div>
      {label ? <span className="slot-label">{label}</span> : null}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("start");
  const [studentName, setStudentName] = useState("Jugador");
  const [module, setModule] = useState("sum");
  const [difficulty, setDifficulty] = useState("easy");

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [enemyHp, setEnemyHp] = useState(3);
  const [playerHp, setPlayerHp] = useState(4);
  const [wave, setWave] = useState(1);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState("Arrastra las piezas correctas para atacar.");
  const [showExplanation, setShowExplanation] = useState(false);
  const [draggingChip, setDraggingChip] = useState(null);
  const [task, setTask] = useState(() => buildOperationTask("sum", "easy"));
  const [playerAttackFx, setPlayerAttackFx] = useState(false);
  const [enemyHitFx, setEnemyHitFx] = useState(false);
  const [answerSolved, setAnswerSolved] = useState(false);

  const [resultSlots, setResultSlots] = useState([]);
  const [usedChipIds, setUsedChipIds] = useState([]);

  const [placeSelection, setPlaceSelection] = useState({
    hundreds: 0,
    tens: 0,
    ones: 0
  });

  const [splitSelection, setSplitSelection] = useState({
    hundreds: "",
    tens: "",
    ones: ""
  });

  const [divisionSelection, setDivisionSelection] = useState({
    missingValue: null
  });

  const difficultyData = useMemo(
    () => DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[0],
    [difficulty]
  );

  const selectedModule = useMemo(
    () => MODULES.find((m) => m.id === module) ?? MODULES[0],
    [module]
  );

  useEffect(() => {
    if (!playerAttackFx && !enemyHitFx) return;
    const timer = setTimeout(() => {
      setPlayerAttackFx(false);
      setEnemyHitFx(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [playerAttackFx, enemyHitFx]);

  function triggerSuccessAnimation() {
    setPlayerAttackFx(true);
    setEnemyHitFx(true);
  }

  function prepareTask(nextTask) {
    setShowExplanation(false);
    setDraggingChip(null);
    setUsedChipIds([]);
    setAnswerSolved(false);
    setPlaceSelection({
      hundreds: 0,
      tens: 0,
      ones: 0
    });
    setSplitSelection({
      hundreds: "",
      tens: "",
      ones: ""
    });
    setDivisionSelection({
      missingValue: null
    });

    if (nextTask.type === "drag-result") {
      setTask(nextTask);
      setResultSlots(Array(nextTask.resultString.length).fill(null));
      return;
    }

    setTask(nextTask);
    setResultSlots([]);
  }

  function beginBattle() {
    const nextTask = buildOperationTask(module, difficulty);
    setEnemyHp(difficultyData.hp);
    setPlayerHp(4);
    setWave(1);
    setCombo(0);
    setScore(0);
    setFeedback("Empieza la batalla matematica.");
    prepareTask(nextTask);
    setScreen("battle");
  }

  function spawnNextQuestion() {
    const nextTask = buildOperationTask(module, difficulty);
    prepareTask(nextTask);
    setFeedback("Siguiente pregunta lista.");
  }

  function nextEnemy(nextWave) {
    const nextTask = buildOperationTask(module, difficulty);
    setEnemyHp(difficultyData.hp + Math.floor(nextWave / 3));
    setFeedback("Nuevo enemigo. Completa el procedimiento para atacar.");
    prepareTask(nextTask);
  }

  function handleCorrect(text) {
    const nextScore = score + 1;
    const nextCombo = combo + 1;
    const enemyAfter = enemyHp - 1;

    setScore(nextScore);
    setCombo(nextCombo);
    setHighScore((prev) => Math.max(prev, nextScore));
    setShowExplanation(true);
    setFeedback(`${text} Ahora puedes pasar a la siguiente pregunta.`);
    setAnswerSolved(true);
    triggerSuccessAnimation();

    if (enemyAfter <= 0) {
      const nextWave = wave + 1;
      setWave(nextWave);
      nextEnemy(nextWave);
    } else {
      setEnemyHp(enemyAfter);
    }
  }

  function handleWrong(text) {
    const nextPlayerHp = playerHp - 1;
    setCombo(0);
    setFeedback(`${text} El enemigo contraataca.`);

    if (nextPlayerHp <= 0) {
      setPlayerHp(0);
      setScreen("gameover");
      return;
    }

    setPlayerHp(nextPlayerHp);
  }

  function resetArithmeticStage() {
    if (task.type === "drag-result") {
      setResultSlots(Array(task.resultString.length).fill(null));
      setUsedChipIds([]);
      setDraggingChip(null);
      return;
    }

    if (task.type === "place-build") {
      setPlaceSelection({
        hundreds: 0,
        tens: 0,
        ones: 0
      });
      return;
    }

    if (task.type === "place-split") {
      setSplitSelection({
        hundreds: "",
        tens: "",
        ones: ""
      });
      return;
    }

    if (task.type === "division-missing") {
      setDivisionSelection({
        missingValue: null
      });
      setUsedChipIds([]);
      setDraggingChip(null);
    }
  }

  function tryValidateArithmetic() {
    if (task.type === "place-build") {
      const ok =
        placeSelection.hundreds === task.base.hundreds &&
        placeSelection.tens === task.base.tens &&
        placeSelection.ones === task.base.ones;

      if (ok) {
        handleCorrect("Correcto.");
      } else {
        handleWrong("La cantidad de bloques base diez no corresponde al numero.");
      }
      return;
    }

    if (task.type === "place-split") {
      const ok =
        Number(splitSelection.hundreds) === task.base.hundreds &&
        Number(splitSelection.tens) === task.base.tens &&
        Number(splitSelection.ones) === task.base.ones;

      if (ok) {
        handleCorrect("Correcto.");
      } else {
        handleWrong("La descomposicion no es correcta.");
      }
      return;
    }

    if (task.type !== "drag-result") return;

    const joined = resultSlots.join("");
    if (joined.length !== task.resultString.length || resultSlots.some((v) => v === null)) {
      setFeedback("Todavia faltan cifras por colocar.");
      return;
    }

    if (joined === task.resultString) {
      handleCorrect("Correcto.");
    } else {
      handleWrong("Las cifras no forman el resultado correcto.");
      resetArithmeticStage();
    }
  }

  function validateDivisionMissing() {
    if (task.type !== "division-missing") return;

    if (!divisionSelection.missingValue) {
      setFeedback("Arrastra un numero al espacio faltante.");
      return;
    }

    if (divisionSelection.missingValue === task.correctValue) {
      handleCorrect("Correcto.");
    } else {
      handleWrong("Ese no es el numero faltante correcto.");
      resetArithmeticStage();
    }
  }

  function dropArithmeticDigit(index) {
    if (!draggingChip || answerSolved) return;
    if (usedChipIds.includes(draggingChip.id)) return;

    const nextSlots = [...resultSlots];
    nextSlots[index] = draggingChip.value;
    setResultSlots(nextSlots);
    setUsedChipIds((prev) => [...prev, draggingChip.id]);
    setDraggingChip(null);
  }

  function dropDivisionMissing() {
    if (!draggingChip || answerSolved || task.type !== "division-missing") return;
    if (usedChipIds.includes(draggingChip.id)) return;

    setDivisionSelection({
      missingValue: draggingChip.value
    });
    setUsedChipIds((prev) => [...prev, draggingChip.id]);
    setDraggingChip(null);
  }

  function renderPlaceBuild() {
    return (
      <>
        <div className="question-panel large">
          <div>Construye el numero {task.number}</div>
        </div>

        <div className="place-builder-panel">
          <div className="place-controls-grid">
            <div className="place-control-card">
              <div className="place-control-title">Centenas</div>
              <div className="place-control-buttons">
                <PixelButton onClick={() => setPlaceSelection((prev) => ({ ...prev, hundreds: Math.max(0, prev.hundreds - 1) }))} disabled={answerSolved}>-</PixelButton>
                <div className="place-control-value">{placeSelection.hundreds}</div>
                <PixelButton onClick={() => setPlaceSelection((prev) => ({ ...prev, hundreds: Math.min(9, prev.hundreds + 1) }))} disabled={answerSolved}>+</PixelButton>
              </div>
            </div>

            <div className="place-control-card">
              <div className="place-control-title">Decenas</div>
              <div className="place-control-buttons">
                <PixelButton onClick={() => setPlaceSelection((prev) => ({ ...prev, tens: Math.max(0, prev.tens - 1) }))} disabled={answerSolved}>-</PixelButton>
                <div className="place-control-value">{placeSelection.tens}</div>
                <PixelButton onClick={() => setPlaceSelection((prev) => ({ ...prev, tens: Math.min(9, prev.tens + 1) }))} disabled={answerSolved}>+</PixelButton>
              </div>
            </div>

            <div className="place-control-card">
              <div className="place-control-title">Unidades</div>
              <div className="place-control-buttons">
                <PixelButton onClick={() => setPlaceSelection((prev) => ({ ...prev, ones: Math.max(0, prev.ones - 1) }))} disabled={answerSolved}>-</PixelButton>
                <div className="place-control-value">{placeSelection.ones}</div>
                <PixelButton onClick={() => setPlaceSelection((prev) => ({ ...prev, ones: Math.min(9, prev.ones + 1) }))} disabled={answerSolved}>+</PixelButton>
              </div>
            </div>
          </div>

          <div className="place-preview-title">Tu construccion</div>
          <BaseTenBoard hundreds={placeSelection.hundreds} tens={placeSelection.tens} ones={placeSelection.ones} />

          <div className="answer-row">
            <PixelButton onClick={tryValidateArithmetic} disabled={answerSolved}>Validar</PixelButton>
            <PixelButton onClick={resetArithmeticStage} disabled={answerSolved}>Limpiar</PixelButton>
          </div>
        </div>
      </>
    );
  }

  function renderPlaceSplit() {
    return (
      <>
        <div className="question-panel large">
          <div>Descompone el numero {task.number}</div>
        </div>

        <div className="place-builder-panel">
          <div className="place-preview-title">Numero a descomponer</div>
          <BaseTenBoard hundreds={task.base.hundreds} tens={task.base.tens} ones={task.base.ones} />

          <div className="split-input-grid">
            <div className="split-input-card">
              <label>Centenas</label>
              <input className="pixel-input" type="number" value={splitSelection.hundreds} onChange={(e) => setSplitSelection((prev) => ({ ...prev, hundreds: e.target.value }))} disabled={answerSolved} />
            </div>

            <div className="split-input-card">
              <label>Decenas</label>
              <input className="pixel-input" type="number" value={splitSelection.tens} onChange={(e) => setSplitSelection((prev) => ({ ...prev, tens: e.target.value }))} disabled={answerSolved} />
            </div>

            <div className="split-input-card">
              <label>Unidades</label>
              <input className="pixel-input" type="number" value={splitSelection.ones} onChange={(e) => setSplitSelection((prev) => ({ ...prev, ones: e.target.value }))} disabled={answerSolved} />
            </div>
          </div>

          <div className="answer-row">
            <PixelButton onClick={tryValidateArithmetic} disabled={answerSolved}>Validar</PixelButton>
            <PixelButton onClick={resetArithmeticStage} disabled={answerSolved}>Limpiar</PixelButton>
          </div>
        </div>
      </>
    );
  }

  function renderDivisionMissing() {
    const shownDivisor =
      task.missingType === "divisor"
        ? (divisionSelection.missingValue ?? "?")
        : task.divisor;

    const shownQuotient =
      task.missingType === "quotient"
        ? (divisionSelection.missingValue ?? "?")
        : task.quotient;

    return (
      <>
        <div className="question-panel large">
          <div className="division-main-title">Completa la division</div>
        </div>

        <div className="division-learning-panel">
          <div className="division-long-wrapper">
            <div
              className={`division-top-quotient ${task.missingType === "quotient" ? "drop-active" : ""}`}
              onDragOver={(e) => task.missingType === "quotient" && e.preventDefault()}
              onDrop={() => task.missingType === "quotient" && dropDivisionMissing()}
            >
              {shownQuotient}
            </div>

            <div className="division-long-row">
              <div
                className={`division-left-divisor ${task.missingType === "divisor" ? "drop-active" : ""}`}
                onDragOver={(e) => task.missingType === "divisor" && e.preventDefault()}
                onDrop={() => task.missingType === "divisor" && dropDivisionMissing()}
              >
                {shownDivisor}
              </div>

              <div className="division-right-area">
                <div className="division-dividend">
                  {task.dividend}
                </div>

                <div className="division-steps-vertical">
                  {task.steps.map((step, idx) => (
                    <div key={idx} className="division-step-block">
                      <div className="division-step-minus">- {step.minus}</div>
                      <div className="division-step-line"></div>
                      <div className="division-step-after">{step.after}</div>
                    </div>
                  ))}
                </div>

                <div className="division-residue-box">
                  <span className="division-residue-label">Residuo</span>
                  <strong>{task.steps[task.steps.length - 1]?.after ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="division-learn-title">Numeros para arrastrar</div>

          <div className="digit-pool">
            {task.pool.map((chip) => (
              <DigitChip
                key={chip.id}
                chip={chip}
                disabled={usedChipIds.includes(chip.id) || answerSolved}
                onDragStart={setDraggingChip}
              />
            ))}
          </div>

          <div className="division-hint-box">
            <strong>Pista:</strong> {task.hint}
          </div>

          <div className="division-process-box">
            <div className="division-process-title">Proceso por resta repetida</div>
            {task.steps.map((step, idx) => (
              <div key={idx} className="division-process-line">
                {step.before} - {step.minus} = {step.after}
              </div>
            ))}
          </div>

          <div className="answer-row">
            <PixelButton onClick={validateDivisionMissing} disabled={answerSolved}>Validar</PixelButton>
            <PixelButton onClick={resetArithmeticStage} disabled={answerSolved}>Limpiar</PixelButton>
          </div>
        </div>
      </>
    );
  }

  function renderArithmeticChallenge() {
    if (task.type === "place-build") return renderPlaceBuild();
    if (task.type === "place-split") return renderPlaceSplit();
    if (task.type === "division-missing") return renderDivisionMissing();

    return (
      <>
        <div className="question-panel large">
          <div>{task.a} {task.symbol} {task.b}</div>
        </div>

        {(task.type === "drag-result" && (task.module === "sum" || task.module === "sub")) ? (
          <div className="base10-preview-row">
            <BaseTenBoard {...decompose(task.a)} compact />
            <div className="op-symbol">{task.symbol}</div>
            <BaseTenBoard {...decompose(task.b)} compact />
          </div>
        ) : null}

        <div className="drag-result-panel">
          <div className="result-row">
            {resultSlots.map((value, index) => (
              <DropSlot key={index} value={value} onDrop={() => dropArithmeticDigit(index)} />
            ))}
          </div>

          <div className="digit-pool">
            {task.pool.map((chip) => (
              <DigitChip
                key={chip.id}
                chip={chip}
                disabled={usedChipIds.includes(chip.id) || answerSolved}
                onDragStart={setDraggingChip}
              />
            ))}
          </div>

          <div className="answer-row">
            <PixelButton onClick={tryValidateArithmetic} disabled={answerSolved}>Validar</PixelButton>
            <PixelButton onClick={resetArithmeticStage} disabled={answerSolved}>Limpiar</PixelButton>
          </div>
        </div>
      </>
    );
  }

  function renderBattleQuestion() {
    return renderArithmeticChallenge();
  }

  if (screen === "start") {
    return (
      <div className="game-shell start-bg">
        <div className="pixel-frame title-screen">
          <div className="title-fire">CAPY MATH</div>
          <div className="title-battle">BATTLE</div>
          <div className="title-sub">ARRASTRAR Y APRENDER</div>

          <div className="start-characters">
            <div className="wizard-big">CAPY</div>
            <div className="monster-big">BOSS</div>
          </div>

          <PixelButton className="big-start" onClick={() => setScreen("select")}>
            TOUCH TO START
          </PixelButton>
        </div>
      </div>
    );
  }

  if (screen === "select") {
    return (
      <div className="game-shell field-bg">
        <div className="top-menu">
          <PixelButton onClick={() => setScreen("start")}>
            <House size={16} />
          </PixelButton>
        </div>

        <div className="pixel-frame select-screen">
          <h2>CHOOSE OPERATION AND LEVEL</h2>

          <div className="selector-row six">
            {MODULES.map((item) => (
              <div key={item.id} className="select-card-wrap">
                <PixelButton
                  className={`select-card ${module === item.id ? "chosen" : ""}`}
                  onClick={() => setModule(item.id)}
                >
                  <span className="select-icon">{item.icon}</span>
                </PixelButton>
                <span className="select-cost">{item.cost}</span>
              </div>
            ))}
          </div>

          <div className="selector-row three">
            {DIFFICULTIES.map((item) => (
              <PixelButton
                key={item.id}
                className={`stage-card ${difficulty === item.id ? "chosen" : ""}`}
                onClick={() => setDifficulty(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.enemy}</small>
              </PixelButton>
            ))}
          </div>

          <div className="name-row">
            <label>Jugador</label>
            <input
              className="pixel-input"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              maxLength={18}
            />
          </div>

          <div className="bottom-bar">
            <div className="highscore-tag">HIGHSCORE {highScore}</div>
            <PixelButton className="next-btn" onClick={beginBattle}>GO</PixelButton>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "gameover") {
    return (
      <div className="game-shell dungeon-bg">
        <div className="pixel-frame gameover-screen">
          <h2>GAME OVER</h2>
          <p>Puntaje final: {score}</p>
          <p>Oleada alcanzada: {wave}</p>

          <div className="gameover-actions">
            <PixelButton onClick={beginBattle}>
              <RefreshCw size={16} />
              Reintentar
            </PixelButton>
            <PixelButton onClick={() => setScreen("select")}>
              <House size={16} />
              Menu
            </PixelButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell field-bg">
      <div className="hud-bar">
        <div className="hud-box left">
          <div className="hud-number">{score}</div>
          <div className="hud-label">SCORE</div>
        </div>

        <div className="hud-center">
          <div className="combat-title">{selectedModule.label}</div>
          <div className="combat-sub">Oleada {wave} - Combo {combo}</div>
        </div>

        <div className="hud-box right">
          <div className="hud-number">{highScore}</div>
          <div className="hud-label">HIGHSCORE</div>
        </div>
      </div>

      <div className="battle-layout">
        <div className="sprites-row">
          <PlayerSprite hp={playerHp} attack={playerAttackFx} />
          <EnemySprite enemy={difficultyData.enemy} code={difficultyData.code} hp={enemyHp} hit={enemyHitFx} />
        </div>

        <div className="battle-panel pixel-frame">
          {renderBattleQuestion()}

          <div className="feedback-bar">
            <WandSparkles size={16} />
            <span>{feedback}</span>
          </div>

          {showExplanation ? (
            <div className="explanation-panel">
              <div className="explanation-head">
                <Lightbulb size={16} />
                EXPLICACION
              </div>
              <ul>
                {task.explanation.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {answerSolved ? (
            <div className="next-question-bar">
              <PixelButton className="next-question-btn" onClick={spawnNextQuestion}>
                <ArrowRight size={18} />
                Siguiente pregunta
              </PixelButton>
            </div>
          ) : null}
        </div>

        <div className="side-panel pixel-frame">
          <div className="side-title">
            <Blocks size={16} />
            PANEL PEDAGOGICO
          </div>

          <div className="side-card">
            <div className="side-chip">
              <Trophy size={14} />
              Modulo
            </div>
            <strong>{selectedModule.label}</strong>
          </div>

          <div className="side-card">
            <div className="side-chip">
              <Shield size={14} />
              Dificultad
            </div>
            <strong>{difficultyData.label}</strong>
          </div>

          <div className="side-card">
            <div className="side-chip">
              <Sword size={14} />
              Jugador
            </div>
            <strong>{studentName || "Jugador"}</strong>
          </div>

          <div className="side-card">
            <div className="side-chip">
              <Skull size={14} />
              Enemigo
            </div>
            <strong>{difficultyData.enemy}</strong>
          </div>

          <div className="side-actions">
            <PixelButton onClick={() => setScreen("select")}>
              <House size={16} />
              Menu
            </PixelButton>
            <PixelButton onClick={beginBattle}>
              <RefreshCw size={16} />
              Reiniciar
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}