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
  Skull
} from "lucide-react";
import "./App.css";

const MODULES = [
  { id: "place", label: "Base Diez", icon: "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦", cost: "1 PT" },
  { id: "sum", label: "Suma", icon: "+", cost: "1 PT" },
  { id: "sub", label: "Resta", icon: "-", cost: "1 PT" },
  { id: "mul", label: "MultiplicaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n", icon: "ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â", cost: "2 PTS" },
  { id: "div", label: "DivisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n", icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â·", cost: "3 PTS" }
];

const DIFFICULTIES = [
  { id: "easy", label: "Pradera", enemy: "Limo", hp: 3 },
  { id: "medium", label: "Ruinas", enemy: "MurciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©lago", hp: 4 },
  { id: "hard", label: "Torre", enemy: "GÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³lem", hp: 5 }
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

function levelRange(difficulty, module) {
  if (module === "place") {
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
    if (difficulty === "easy") return { divisorMin: 2, divisorMax: 4, quotientMin: 2, quotientMax: 7 };
    if (difficulty === "medium") return { divisorMin: 2, divisorMax: 6, quotientMin: 4, quotientMax: 10 };
    return { divisorMin: 3, divisorMax: 9, quotientMin: 6, quotientMax: 14 };
  }

  if (difficulty === "easy") return { min: 10, max: 99 };
  if (difficulty === "medium") return { min: 80, max: 299 };
  return { min: 200, max: 999 };
}

function buildOperationTask(module, difficulty) {
  if (module === "place") {
    const { min, max } = levelRange(difficulty, module);
    const number = randomInt(min, max);
    const resultString = String(number);

    return {
      type: "place-drag",
      module,
      title: "Construye el nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero con Base Diez",
      prompt: "Arrastra las cifras correctas al nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero y observa centenas, decenas y unidades.",
      number,
      resultString,
      base: decompose(number),
      pool: buildDigitPool(resultString, 4),
      explanation: [
        "Una centena vale 100.",
        "Una decena vale 10.",
        "Una unidad vale 1.",
        `${number} = ${decompose(number).hundreds} centenas + ${decompose(number).tens} decenas + ${decompose(number).ones} unidades.`
      ]
    };
  }

  if (module === "sum") {
    const { min, max } = levelRange(difficulty, module);
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    const result = a + b;
    const resultString = String(result);

    return {
      type: "drag-result",
      module,
      title: "Completa la suma",
      prompt: "Arrastra las cifras correctas al resultado.",
      a,
      b,
      symbol: "+",
      result,
      resultString,
      pool: buildDigitPool(resultString, 4),
      explanation: [
        "Sumar significa juntar cantidades.",
        `${a} tiene ${decompose(a).hundreds} centenas, ${decompose(a).tens} decenas y ${decompose(a).ones} unidades.`,
        `${b} tiene ${decompose(b).hundreds} centenas, ${decompose(b).tens} decenas y ${decompose(b).ones} unidades.`,
        `Al juntar ambas cantidades obtenemos ${result}.`
      ]
    };
  }

  if (module === "sub") {
    const { min, max } = levelRange(difficulty, module);
    const a = randomInt(min, max);
    const b = randomInt(min, Math.max(min, a - 1));
    const result = a - b;
    const resultString = String(result);

    return {
      type: "drag-result",
      module,
      title: "Completa la resta",
      prompt: "Arrastra las cifras correctas al resultado.",
      a,
      b,
      symbol: "-",
      result,
      resultString,
      pool: buildDigitPool(resultString, 4),
      explanation: [
        "Restar significa quitar o comparar cantidades.",
        `${a} - ${b} = ${result}.`,
        "La diferencia es la cantidad que queda."
      ]
    };
  }

  if (module === "mul") {
    const { aMin, aMax, bMin, bMax } = levelRange(difficulty, module);
    const a = randomInt(aMin, aMax);
    const b = randomInt(bMin, bMax);
    const result = a * b;
    const resultString = String(result);

    return {
      type: "drag-result",
      module,
      title: "Completa la multiplicaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n",
      prompt: "Arrastra las cifras correctas al resultado.",
      a,
      b,
      symbol: "ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
      result,
      resultString,
      pool: buildDigitPool(resultString, 4),
      explanation: [
        "Multiplicar significa repetir grupos iguales.",
        `Tienes ${a} grupos con ${b} elementos.`,
        `${a} ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${b} = ${result}.`
      ]
    };
  }

  const { divisorMin, divisorMax, quotientMin, quotientMax } = levelRange(difficulty, module);
  const divisor = randomInt(divisorMin, divisorMax);
  const quotientTarget = randomInt(quotientMin, quotientMax);
  const remainderTarget = randomInt(0, divisor - 1);
  const dividend = divisor * quotientTarget + remainderTarget;

  return {
    type: "division-drag",
    module,
    title: "DivisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n guiada por arrastre",
    prompt: "Arrastra la resta correcta, el nuevo cociente y al final el residuo.",
    dividend,
    divisor,
    current: dividend,
    quotientCount: 0,
    remainderTarget,
    quotientTarget,
    stepPool: [],
    history: [],
    finalPhase: false,
    explanation: [
      `El dividendo es ${dividend}.`,
      `El divisor es ${divisor}.`,
      `El cociente final es ${quotientTarget}.`,
      `El residuo final es ${remainderTarget}.`,
      "La divisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n aquÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­ se entiende como resta repetida."
    ]
  };
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
          {hundreds === 0 && <span className="zero-tag">0</span>}
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
          {tens === 0 && <span className="zero-tag">0</span>}
        </div>
      </div>

      <div className="place-column">
        <span className="place-title">U</span>
        <div className="units-cloud">
          {Array.from({ length: ones }).map((_, i) => (
            <span key={i} className="one-pixel" />
          ))}
          {ones === 0 && <span className="zero-tag">0</span>}
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

function EnemySprite({ enemy, hp, hit }) {
  const faces = {
    Limo: "Ã°Å¸â€˜Â¾",
    Murcielago: "Ã°Å¸Â¦â€¡",
    Golem: "Ã°Å¸ÂªÂ¨"
  };

  return (
    <div className={`sprite-card enemy ${hit ? "enemy-hit" : ""}`}>
      <div className="sprite-label">{enemy}</div>
      <div className="sprite-emoji">{faces[enemy] ?? "Ã°Å¸â€˜Â¾"}</div>
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

function DropSlot({ value, onDrop, label }) {
  return (
    <div
      className="drop-slot-wrap"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="drop-slot">{value ?? "?"}</div>
      {label && <span className="slot-label">{label}</span>}
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

  const [resultSlots, setResultSlots] = useState([]);
  const [usedChipIds, setUsedChipIds] = useState([]);

  const [divisionSlots, setDivisionSlots] = useState({
    subtractionResult: null,
    quotientValue: null,
    remainderValue: null
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
    setTask(nextTask);
    setShowExplanation(false);
    setDraggingChip(null);
    setUsedChipIds([]);

    if (nextTask.type === "drag-result" || nextTask.type === "place-drag") {
      setResultSlots(Array(nextTask.resultString.length).fill(null));
      setDivisionSlots({
        subtractionResult: null,
        quotientValue: null,
        remainderValue: null
      });
    } else {
      const nextCurrent = nextTask.current;
      const nextSub = nextCurrent - nextTask.divisor;
      const nextQuotient = nextTask.quotientCount + 1;
      const basePool = [
        { id: `sub-${nextSub}-a`, value: String(nextSub) },
        { id: `quo-${nextQuotient}-a`, value: String(nextQuotient) },
        { id: `fake-a-${Math.random()}`, value: String(Math.max(0, nextSub + randomInt(1, 4))) },
        { id: `fake-b-${Math.random()}`, value: String(Math.max(0, nextQuotient + randomInt(1, 3))) }
      ];

      setResultSlots([]);
      setDivisionSlots({
        subtractionResult: null,
        quotientValue: null,
        remainderValue: null
      });
      setTask((prev) => ({
        ...nextTask,
        stepPool: shuffle(basePool)
      }));
    }
  }

  function beginBattle() {
    const nextTask = buildOperationTask(module, difficulty);
    setEnemyHp(difficultyData.hp);
    setPlayerHp(4);
    setWave(1);
    setCombo(0);
    setScore(0);
    setFeedback("ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡Empieza la batalla matemÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡tica!");
    prepareTask(nextTask);
    setScreen("battle");
  }

  function nextEnemy(nextWave) {
    const nextTask = buildOperationTask(module, difficulty);
    setEnemyHp(difficultyData.hp + Math.floor(nextWave / 3));
    setFeedback("ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡Nuevo enemigo! Completa el procedimiento para atacar.");
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
    setFeedback(`${text} Atacaste al enemigo.`);
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
    if (task.type !== "drag-result" && task.type !== "place-drag") return;
    setResultSlots(Array(task.resultString.length).fill(null));
    setUsedChipIds([]);
    setDraggingChip(null);
  }

  function tryValidateArithmetic() {
    if (task.type !== "drag-result" && task.type !== "place-drag") return;

    const joined = resultSlots.join("");
    if (joined.length !== task.resultString.length || resultSlots.some((v) => v === null)) {
      setFeedback("TodavÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a faltan cifras por colocar.");
      return;
    }

    if (joined === task.resultString) {
      handleCorrect("ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡Correcto!");
    } else {
      handleWrong("Las cifras no forman el resultado correcto.");
      resetArithmeticStage();
    }
  }

  function dropArithmeticDigit(index) {
    if (!draggingChip) return;
    if (usedChipIds.includes(draggingChip.id)) return;

    const nextSlots = [...resultSlots];
    nextSlots[index] = draggingChip.value;
    setResultSlots(nextSlots);
    setUsedChipIds((prev) => [...prev, draggingChip.id]);
    setDraggingChip(null);
  }

  function resetDivisionStage(nextCurrent = task.current, nextQuotient = task.quotientCount) {
    const nextSub = nextCurrent - task.divisor;
    const pool = [
      { id: `sub-${nextSub}-${Math.random()}`, value: String(nextSub) },
      { id: `quo-${nextQuotient + 1}-${Math.random()}`, value: String(nextQuotient + 1) },
      { id: `fake-a-${Math.random()}`, value: String(Math.max(0, nextSub + randomInt(1, 4))) },
      { id: `fake-b-${Math.random()}`, value: String(Math.max(0, nextQuotient + randomInt(2, 4))) }
    ];

    setUsedChipIds([]);
    setDivisionSlots({
      subtractionResult: null,
      quotientValue: null,
      remainderValue: null
    });
    setTask((prev) => ({
      ...prev,
      stepPool: shuffle(pool)
    }));
  }

  function dropDivisionSlot(slotName) {
    if (!draggingChip || task.type !== "division-drag") return;
    if (usedChipIds.includes(draggingChip.id)) return;

    setDivisionSlots((prev) => ({
      ...prev,
      [slotName]: draggingChip.value
    }));
    setUsedChipIds((prev) => [...prev, draggingChip.id]);
    setDraggingChip(null);
  }

  function validateDivisionStep() {
    if (task.type !== "division-drag") return;

    if (!task.finalPhase) {
      if (!divisionSlots.subtractionResult || !divisionSlots.quotientValue) {
        setFeedback("Faltan piezas por arrastrar en este paso.");
        return;
      }

      const expectedSub = String(task.current - task.divisor);
      const expectedQuotient = String(task.quotientCount + 1);

      if (
        divisionSlots.subtractionResult === expectedSub &&
        divisionSlots.quotientValue === expectedQuotient
      ) {
        const nextCurrent = task.current - task.divisor;
        const nextQuotient = task.quotientCount + 1;
        const finished = nextCurrent < task.divisor;

        const nextHistory = [
          ...task.history,
          `${task.current} - ${task.divisor} = ${nextCurrent}`
        ];

        if (finished) {
          const finalPool = [
            { id: `rem-${nextCurrent}-${Math.random()}`, value: String(nextCurrent) },
            { id: `quo-final-${nextQuotient}-${Math.random()}`, value: String(nextQuotient) },
            { id: `fake-rem-${Math.random()}`, value: String(Math.max(0, nextCurrent + randomInt(1, 3))) },
            { id: `fake-q-${Math.random()}`, value: String(nextQuotient + randomInt(1, 3)) }
          ];

          setTask((prev) => ({
            ...prev,
            current: nextCurrent,
            quotientCount: nextQuotient,
            history: nextHistory,
            finalPhase: true,
            stepPool: shuffle(finalPool)
          }));

          setUsedChipIds([]);
          setDivisionSlots({
            subtractionResult: null,
            quotientValue: null,
            remainderValue: null
          });
          setFeedback("Muy bien. Ahora arrastra el cociente final y el residuo.");
        } else {
          setTask((prev) => ({
            ...prev,
            current: nextCurrent,
            quotientCount: nextQuotient,
            history: nextHistory
          }));
          resetDivisionStage(nextCurrent, nextQuotient);
          setFeedback(`Bien. Ahora sigue con ${nextCurrent} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â· ${task.divisor} por resta repetida.`);
        }
      } else {
        handleWrong("Las piezas de este paso no son correctas.");
        resetDivisionStage(task.current, task.quotientCount);
      }
      return;
    }

    if (!divisionSlots.quotientValue || !divisionSlots.remainderValue) {
      setFeedback("Faltan piezas por arrastrar para terminar la divisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n.");
      return;
    }

    if (
      divisionSlots.quotientValue === String(task.quotientTarget) &&
      divisionSlots.remainderValue === String(task.remainderTarget)
    ) {
      handleCorrect("ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡Muy bien! Terminaste la divisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n correctamente.");
    } else {
      handleWrong("El cociente final o el residuo no son correctos.");
      const finalPool = [
        { id: `rem-${task.current}-${Math.random()}`, value: String(task.current) },
        { id: `quo-final-${task.quotientCount}-${Math.random()}`, value: String(task.quotientCount) },
        { id: `fake-rem-${Math.random()}`, value: String(Math.max(0, task.current + randomInt(1, 3))) },
        { id: `fake-q-${Math.random()}`, value: String(task.quotientCount + randomInt(1, 3)) }
      ];

      setTask((prev) => ({
        ...prev,
        stepPool: shuffle(finalPool)
      }));
      setUsedChipIds([]);
      setDivisionSlots({
        subtractionResult: null,
        quotientValue: null,
        remainderValue: null
      });
    }
  }

  function renderArithmeticChallenge() {
    return (
      <>
        <div className="question-panel large">
          {task.type === "place-drag" ? (
            <div>Construye el nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero {task.number}</div>
          ) : (
            <div>
              {task.a} {task.symbol} {task.b}
            </div>
          )}
        </div>

        {task.type === "place-drag" && (
          <BaseTenBoard
            hundreds={task.base.hundreds}
            tens={task.base.tens}
            ones={task.base.ones}
          />
        )}

        {(task.type === "drag-result" && (task.module === "sum" || task.module === "sub")) && (
          <div className="base10-preview-row">
            <BaseTenBoard {...decompose(task.a)} compact />
            <div className="op-symbol">{task.symbol}</div>
            <BaseTenBoard {...decompose(task.b)} compact />
          </div>
        )}

        <div className="drag-result-panel">
          <div className="result-row">
            {resultSlots.map((value, index) => (
              <DropSlot
                key={index}
                value={value}
                onDrop={() => dropArithmeticDigit(index)}
              />
            ))}
          </div>

          <div className="digit-pool">
            {task.pool.map((chip) => (
              <DigitChip
                key={chip.id}
                chip={chip}
                disabled={usedChipIds.includes(chip.id)}
                onDragStart={setDraggingChip}
              />
            ))}
          </div>

          <div className="answer-row">
            <PixelButton onClick={tryValidateArithmetic}>Validar</PixelButton>
            <PixelButton onClick={resetArithmeticStage}>Limpiar</PixelButton>
          </div>
        </div>
      </>
    );
  }

  function renderDivisionChallenge() {
    return (
      <>
        <div className="question-panel large">
          <div>{task.dividend} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â· {task.divisor}</div>
        </div>

        <div className="division-cards">
          <div className="mini-info">Dividendo: <strong>{task.dividend}</strong></div>
          <div className="mini-info">Divisor: <strong>{task.divisor}</strong></div>
          <div className="mini-info">Valor actual: <strong>{task.current}</strong></div>
          <div className="mini-info">Cociente actual: <strong>{task.quotientCount}</strong></div>
        </div>

        {!task.finalPhase ? (
          <div className="division-step-grid">
            <div className="division-operation-card">
              <div className="division-line">
                <span>{task.current}</span>
                <span>-</span>
                <span>{task.divisor}</span>
                <span>=</span>
                <DropSlot
                  value={divisionSlots.subtractionResult}
                  onDrop={() => dropDivisionSlot("subtractionResult")}
                  label="Resta"
                />
              </div>

              <div className="division-line">
                <span>Cociente nuevo</span>
                <DropSlot
                  value={divisionSlots.quotientValue}
                  onDrop={() => dropDivisionSlot("quotientValue")}
                  label="Cociente"
                />
              </div>
            </div>

            <div className="digit-pool">
              {task.stepPool.map((chip) => (
                <DigitChip
                  key={chip.id}
                  chip={chip}
                  disabled={usedChipIds.includes(chip.id)}
                  onDragStart={setDraggingChip}
                />
              ))}
            </div>

            <div className="answer-row">
              <PixelButton onClick={validateDivisionStep}>Validar paso</PixelButton>
            </div>
          </div>
        ) : (
          <div className="division-step-grid">
            <div className="division-operation-card">
              <div className="division-line">
                <span>Cociente final</span>
                <DropSlot
                  value={divisionSlots.quotientValue}
                  onDrop={() => dropDivisionSlot("quotientValue")}
                  label="Final"
                />
              </div>

              <div className="division-line">
                <span>Residuo final</span>
                <DropSlot
                  value={divisionSlots.remainderValue}
                  onDrop={() => dropDivisionSlot("remainderValue")}
                  label="Residuo"
                />
              </div>
            </div>

            <div className="digit-pool">
              {task.stepPool.map((chip) => (
                <DigitChip
                  key={chip.id}
                  chip={chip}
                  disabled={usedChipIds.includes(chip.id)}
                  onDragStart={setDraggingChip}
                />
              ))}
            </div>

            <div className="answer-row">
              <PixelButton onClick={validateDivisionStep}>Finalizar divisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n</PixelButton>
            </div>
          </div>
        )}

        <div className="division-history">
          <div className="history-title">Proceso</div>
          {task.history.length === 0 ? (
            <div className="history-empty">TodavÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a no has completado ningÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºn paso.</div>
          ) : (
            task.history.map((line, idx) => (
              <div key={idx} className="history-line">{line}</div>
            ))
          )}
        </div>
      </>
    );
  }

  function renderBattleQuestion() {
    if (task.type === "division-drag") return renderDivisionChallenge();
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
            <div className="wizard-big">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚Â«</div>
            <div className="monster-big">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“Ãƒâ€šÃ‚Â¾</div>
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

          <div className="selector-row five">
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
            <PixelButton className="next-btn" onClick={beginBattle}>
              ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¶
            </PixelButton>
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
              MenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº
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
          <div className="combat-sub">Oleada {wave} ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· Combo {combo}</div>
        </div>

        <div className="hud-box right">
          <div className="hud-number">{highScore}</div>
          <div className="hud-label">HIGHSCORE</div>
        </div>
      </div>

      <div className="battle-layout">
        <div className="sprites-row">
          <PlayerSprite hp={playerHp} attack={playerAttackFx} />
          <EnemySprite enemy={difficultyData.enemy} hp={enemyHp} hit={enemyHitFx} />
        </div>

        <div className="battle-panel pixel-frame">
          {renderBattleQuestion()}

          <div className="feedback-bar">
            <WandSparkles size={16} />
            <span>{feedback}</span>
          </div>

          {showExplanation && (
            <div className="explanation-panel">
              <div className="explanation-head">
                <Lightbulb size={16} />
                EXPLICACIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œN
              </div>
              <ul>
                {task.explanation.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="side-panel pixel-frame">
          <div className="side-title">
            <Blocks size={16} />
            PANEL PEDAGÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œGICO
          </div>

          <div className="side-card">
            <div className="side-chip">
              <Trophy size={14} />
              MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³dulo
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
              MenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº
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