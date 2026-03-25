import React, { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const BASE_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const directionRef = useRef(direction);
  
  // Keep ref updated to prevent rapid reverse key presses causing self-collision
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (!hasStarted || isPaused || gameOver) return;

      const currentDir = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isPaused, gameOver]);

  useEffect(() => {
    if (!hasStarted || isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, BASE_SPEED - Math.floor(score / 50) * 10);
    const gameLoop = setInterval(moveSnake, speed);

    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, hasStarted, isPaused, score, generateFood]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center justify-between w-full max-w-md px-4">
        <div className="text-neon-green font-mono text-xl drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
        <div className="text-gray-500 font-mono text-sm">
          {isPaused ? 'PAUSED' : 'PLAYING'}
        </div>
      </div>

      <div className="relative bg-gray-900 border-2 border-gray-800 rounded-lg p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        {/* Grid Container */}
        <div 
          className="grid gap-[1px] bg-gray-800/50"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(80vw, 400px)',
            height: 'min(80vw, 400px)'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            let cellClass = "bg-gray-900/80 w-full h-full rounded-sm transition-all duration-75";
            
            if (isSnakeHead) {
              cellClass = "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] rounded-sm z-10 relative";
            } else if (isSnakeBody) {
              cellClass = "bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)] rounded-sm";
            } else if (isFood) {
              cellClass = "bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.9)] rounded-full animate-pulse";
            }

            return <div key={i} className={cellClass} />;
          })}
        </div>

        {/* Overlays */}
        {(!hasStarted || gameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
            {gameOver ? (
              <>
                <h2 className="text-4xl font-black text-red-500 mb-2 tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">GAME OVER</h2>
                <p className="text-green-400 font-mono text-xl mb-8 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">FINAL SCORE: {score}</p>
              </>
            ) : (
              <h2 className="text-4xl font-black text-green-400 mb-8 tracking-widest drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">NEON SNAKE</h2>
            )}
            
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-transparent border-2 border-green-400 text-green-400 font-bold tracking-widest rounded hover:bg-green-400 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.8)]"
            >
              {gameOver ? 'PLAY AGAIN' : 'START GAME'}
            </button>
            <p className="text-gray-500 font-mono text-xs mt-6">Use Arrow Keys or WASD to move. Space to pause.</p>
          </div>
        )}
      </div>
    </div>
  );
}
