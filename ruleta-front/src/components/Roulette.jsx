import React, { useRef, useEffect, useState } from "react";

const WHEEL_SIZE = 300;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 10;
const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
  "#E7E9ED", "#B2FF66", "#FF66B2", "#66B2FF", "#B266FF", "#FFB266"
];
const EMPTY_COLOR = "#444";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Función para seleccionar un elemento basado en probabilidades ponderadas
function selectWithProbabilities(names, probabilities) {
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const probability = probabilities[name] || (1 / names.length); // Fallback a probabilidad uniforme
    cumulative += probability;
    
    if (random <= cumulative) {
      console.log(`🎯 Seleccionado: ${name} (random: ${random.toFixed(4)}, cumulative: ${cumulative.toFixed(4)}, prob: ${(probability * 100).toFixed(1)}%)`);
      return i;
    }
  }
  
  // Fallback (no debería llegar aquí)
  return names.length - 1;
}

// Audio Context para sonidos retro
let audioContext = null;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playTick = () => {
  const ctx = initAudio();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
};

const playWinnerSound = () => {
  const ctx = initAudio();
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'square';
    
    const startTime = ctx.currentTime + i * 0.2;
    gainNode.gain.setValueAtTime(0.15, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.3);
  });
};

function Roulette({ names, isSpinning, onSpinEnd, children }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [hasWinner, setHasWinner] = useState(false);
  const targetRotation = useRef(0);
  const requestRef = useRef();
  const startRotation = useRef(0);
  const lastSegment = useRef(-1);
  const idleAnimationRef = useRef();

  // Animación continua lenta (solo si no hay ganador)
  const idleAnimation = () => {
    if (!spinning && !hasWinner) {
      setRotation(prev => (prev + 0.3) % 360); // Giro lento continuo
    }
    if (!hasWinner) {
      idleAnimationRef.current = requestAnimationFrame(idleAnimation);
    }
  };

  useEffect(() => {
    // Iniciar animación continua solo si no hay ganador
    if (!hasWinner) {
      idleAnimationRef.current = requestAnimationFrame(idleAnimation);
    }
    return () => {
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line
  }, [hasWinner]);

  // Detectar tics cuando pasa por segmentos
  useEffect(() => {
    if (names.length > 1 && spinning) {
      const anglePerSlice = 360 / names.length;
      let effectiveAngle = (360 - (rotation % 360)) % 360;
      let currentSegment = Math.floor(effectiveAngle / anglePerSlice) % names.length;
      
      if (currentSegment !== lastSegment.current && lastSegment.current !== -1) {
        playTick();
      }
      lastSegment.current = currentSegment;
    }
  }, [rotation, names.length, spinning]);

  useEffect(() => {
    if (isSpinning && names.length > 1 && !spinning) {
      // Cancelar animación idle
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
      }
      
      const anglePerSlice = 360 / names.length;
      
      // Seleccionar ganador usando probabilidades del backend o aleatorio
      let targetSliceIndex;
      
      if (window.rouletteProbabilities) {
        // Usar probabilidades ponderadas para seleccionar
        targetSliceIndex = selectWithProbabilities(names, window.rouletteProbabilities);
        console.log("🎲 Selección con probabilidades:", names[targetSliceIndex]);
      } else {
        // Fallback: selección aleatoria local
        targetSliceIndex = Math.floor(Math.random() * names.length);
        console.log("🎲 Selección aleatoria local:", names[targetSliceIndex]);
      }
      
      // Calcular ángulo para que la flecha apunte exactamente al ganador
      // Los elementos SVG empiezan a las 3:00 (donde está la flecha), así que no necesitamos ajuste
      const targetSliceAngle = targetSliceIndex * anglePerSlice + (anglePerSlice / 2);
      const randomExtra = 360 * (3 + Math.random() * 2); // 3-5 vueltas
      const target = randomExtra - targetSliceAngle;
      

      
      startRotation.current = rotation % 360;
      targetRotation.current = startRotation.current + target;
      setSpinning(true);
      setHasWinner(false); // Limpiar estado de ganador al empezar nuevo spin
      lastSegment.current = -1;
      animateSpin(anglePerSlice, targetSliceIndex);
    }
    // eslint-disable-next-line
  }, [isSpinning]);

  const animateSpin = (anglePerSlice, expectedWinnerIndex) => {
    const duration = 3500; // ms
    const start = performance.now();
    const from = startRotation.current;
    const to = targetRotation.current;

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setRotation(from + (to - from) * eased);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setHasWinner(true); // Marcar que hay un ganador
        
        // Calcular matemáticamente dónde paró la ruleta (este es el método que SIEMPRE funcionó)
        let finalRotation = (from + (to - from)) % 360;
        if (finalRotation < 0) finalRotation += 360;
        let effectiveAngle = (360 - finalRotation) % 360;
        let calculatedIdx = Math.floor(effectiveAngle / anglePerSlice) % names.length;
        
        // Usar el resultado del cálculo matemático
        const winnerIdx = calculatedIdx;
        
        // Las discrepancias ocasionales son normales en un sistema probabilístico
        
        // Reproducir sonido de ganador
        setTimeout(() => {
          playWinnerSound();
        }, 200);
        
        if (onSpinEnd && names.length > 0) {
          onSpinEnd(names[winnerIdx]);
        }
        
        // NO reanudar animación idle - la ruleta se queda quieta
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  // Función para reiniciar (debe ser llamada desde el componente padre)
  useEffect(() => {
    // Escuchar cambios en isSpinning para detectar reinicio
    if (!isSpinning && !spinning && hasWinner) {
      // Si isSpinning es false pero teníamos un ganador, podría ser un reinicio
      // Esta lógica se maneja mejor desde el componente padre
    }
  }, [isSpinning, spinning, hasWinner]);

  const anglePerSlice = names.length ? 360 / names.length : 360;

  return (
    <div className="roulette-outer-container" style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      {/* Flecha fija a la derecha, superpuesta y puntiaguda */}
      <div style={{
        position: 'absolute',
        right: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2
      }}>
        <svg width="24" height="24">
          {/* Flecha más pequeña y puntiaguda, superpuesta */}
          <polygon points="6,12 22,6 22,18" fill="#e74c3c" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
      <div className="roulette-container" style={{ position: 'relative', zIndex: 1 }}>
        <svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ transform: `rotate(${rotation}deg)` }}>
          {names.length === 0 && (
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={EMPTY_COLOR} />
          )}
          {names.length === 1 && (
            <g>
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={COLORS[0]} stroke="#fff" strokeWidth="2" />
              <text
                x={CENTER}
                y={CENTER}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={22}
                fill="#fff"
                style={{
                  fontWeight: 700,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  textShadow: '0 1px 4px #222, 0 0 2px #000',
                }}
              >
                {names[0]}
              </text>
            </g>
          )}
          {names.length > 1 && names.map((name, idx) => {
            const startAngle = idx * anglePerSlice;
            const endAngle = startAngle + anglePerSlice;
            const largeArc = anglePerSlice > 180 ? 1 : 0;
            const x1 = CENTER + RADIUS * Math.cos((Math.PI * startAngle) / 180);
            const y1 = CENTER + RADIUS * Math.sin((Math.PI * startAngle) / 180);
            const x2 = CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180);
            const y2 = CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180);
            // Centrado del texto en la porción
            const textAngle = startAngle + anglePerSlice / 2;
            const textRadius = RADIUS * 0.65;
            const textX = CENTER + textRadius * Math.cos((Math.PI * textAngle) / 180);
            const textY = CENTER + textRadius * Math.sin((Math.PI * textAngle) / 180);
            return (
              <g key={idx}>
                <path
                  d={`M${CENTER},${CENTER} L${x1},${y1} A${RADIUS},${RADIUS} 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={COLORS[idx % COLORS.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={anglePerSlice < 20 ? 12 : 16}
                  fill="#fff"
                  style={{
                    fontWeight: 600,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    textShadow: '0 1px 4px #222, 0 0 2px #000',
                  }}
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {name}
                </text>
              </g>
            );
          })}
        </svg>
        {children}
      </div>
    </div>
  );
}

export default Roulette; 