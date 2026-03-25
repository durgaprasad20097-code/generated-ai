import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

export default function CarGame() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const initGame = () => {
    if (!sceneRef.current) return;

    // Cleanup previous instance if exists
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
    }

    setScore(0);

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Composite = Matter.Composite,
          Constraint = Matter.Constraint,
          Body = Matter.Body,
          Bodies = Matter.Bodies,
          Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 500,
        background: 'transparent',
        wireframes: false,
        hasBounds: true,
      }
    });
    renderRef.current = render;

    // --- Create Car ---
    const group = Body.nextGroup(true);
    
    // Chassis
    const chassis = Bodies.rectangle(100, 100, 140, 30, {
      collisionFilter: { group },
      density: 0.002,
      render: { fillStyle: '#ec4899' }, // Neon pink
      chamfer: { radius: 10 }
    });

    // Cabin
    const cabin = Bodies.rectangle(100, 75, 70, 25, {
      collisionFilter: { group },
      density: 0.001,
      render: { fillStyle: '#a855f7' }, // Neon purple
      chamfer: { radius: 10 }
    });

    const cabinConstraint1 = Constraint.create({
      bodyA: chassis,
      bodyB: cabin,
      pointA: { x: 0, y: -15 },
      pointB: { x: 0, y: 12 },
      stiffness: 1,
      length: 0,
      render: { visible: false }
    });

    const cabinConstraint2 = Constraint.create({
      bodyA: chassis,
      bodyB: cabin,
      pointA: { x: -20, y: -15 },
      pointB: { x: -20, y: 12 },
      stiffness: 1,
      length: 0,
      render: { visible: false }
    });

    // Wheels
    const wheelOptions = {
      collisionFilter: { group },
      friction: 0.9,
      frictionStatic: 1,
      restitution: 0.1,
      density: 0.005,
      render: { fillStyle: '#22d3ee', strokeStyle: '#ffffff', lineWidth: 2 } // Neon cyan
    };

    const wheelA = Bodies.circle(45, 130, 25, wheelOptions); // Back wheel
    const wheelB = Bodies.circle(155, 130, 25, wheelOptions); // Front wheel

    // Suspension
    const axelA = Constraint.create({
      bodyA: chassis,
      bodyB: wheelA,
      pointA: { x: -45, y: 15 },
      stiffness: 0.2,
      damping: 0.1,
      length: 20,
      render: { visible: true, strokeStyle: '#ffffff', lineWidth: 2 }
    });

    const axelB = Constraint.create({
      bodyA: chassis,
      bodyB: wheelB,
      pointA: { x: 45, y: 15 },
      stiffness: 0.2,
      damping: 0.1,
      length: 20,
      render: { visible: true, strokeStyle: '#ffffff', lineWidth: 2 }
    });

    const car = Composite.create({
      bodies: [chassis, cabin, wheelA, wheelB],
      constraints: [cabinConstraint1, cabinConstraint2, axelA, axelB]
    });

    Composite.add(engine.world, car);

    // --- Create Terrain ---
    const terrain: Matter.Body[] = [];
    let lastX = -500;
    let lastY = 400;

    const generateTerrain = (upToX: number) => {
      while (lastX < upToX) {
        const nextX = lastX + 100;
        // Procedural terrain using sine waves
        const nextY = 400 + Math.sin(nextX / 300) * 150 + Math.sin(nextX / 800) * 200 + Math.sin(nextX / 150) * 50;
        
        const dx = nextX - lastX;
        const dy = nextY - lastY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const cx = lastX + dx / 2;
        const cy = lastY + dy / 2;

        const segment = Bodies.rectangle(cx, cy, length + 4, 60, {
          isStatic: true,
          angle: angle,
          friction: 1,
          render: { fillStyle: '#4ade80' } // Neon green
        });

        Composite.add(engine.world, segment);
        terrain.push(segment);
        lastX = nextX;
        lastY = nextY;
      }
    };

    // Initial terrain
    generateTerrain(3000);

    // --- Controls & Game Loop ---
    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    Events.on(engine, 'beforeUpdate', () => {
      // Camera follow
      Render.lookAt(render, {
        min: { x: chassis.position.x - 300, y: chassis.position.y - 300 },
        max: { x: chassis.position.x + 500, y: chassis.position.y + 200 }
      });

      // Infinite terrain generation
      if (chassis.position.x > lastX - 1500) {
        generateTerrain(lastX + 2000);
      }

      // Cleanup old terrain behind the player to save memory
      while (terrain.length > 0 && terrain[0].position.x < chassis.position.x - 1000) {
        const old = terrain.shift();
        if (old) Composite.remove(engine.world, old);
      }

      // Apply controls
      if (keys['arrowright'] || keys['d']) {
        // Accelerate (apply torque to wheels - 4WD for better climbing)
        wheelA.torque = 0.25;
        wheelB.torque = 0.15;
      }
      if (keys['arrowleft'] || keys['a']) {
        // Brake / Reverse
        wheelA.torque = -0.2;
        wheelB.torque = -0.2;
      }
      if (keys['arrowup'] || keys['w']) {
        // Lean back / Flip backwards
        chassis.torque = -0.4;
      }
      if (keys['arrowdown'] || keys['s']) {
        // Lean forward / Flip forwards
        chassis.torque = 0.4;
      }

      // Update score based on distance
      setScore(Math.max(0, Math.floor(chassis.position.x / 10)));
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  };

  useEffect(() => {
    if (isStarted) {
      const cleanup = initGame();
      return cleanup;
    }
  }, [isStarted]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between w-full px-4">
        <div className="text-neon-green font-mono text-2xl drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
          DISTANCE: {score}m
        </div>
        <div className="text-gray-400 font-mono text-sm flex gap-4">
          <span>[W/S] Flip/Lean</span>
          <span>[A/D] Drive</span>
        </div>
      </div>

      <div className="relative bg-gray-900 border-2 border-gray-800 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full aspect-[16/10]">
        
        {/* The Matter.js Canvas Container */}
        <div ref={sceneRef} className="absolute inset-0 w-full h-full" />

        {/* Overlays */}
        {!isStarted && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <h2 className="text-5xl font-black text-cyan-400 mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] italic">
              NEON CRUISER
            </h2>
            <p className="text-pink-500 font-mono text-lg mb-8 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
              NO CRASHES. JUST DRIVE.
            </p>
            <button
              onClick={() => setIsStarted(true)}
              className="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold tracking-widest rounded hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]"
            >
              START ENGINE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
