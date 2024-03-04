import React, { useEffect, useRef, useState } from "react";

import {Canvas} from '../../canvas-library/canvas'
import { Bird, Pipe } from '../../game-library/flappy'
export default function FlappyGA() {
  const [canvasObj, setcanvasObj] = useState<Canvas>();
  const [bird, setbirdObj] = useState<Bird>();
  const [pipes,setPipes] = useState<Pipe[]>([new Pipe({ x: 300, y: 0 }, "green")]);
  const canvasRef = useRef<HTMLCanvasElement>();
  const canvasWidth = 16 * 50; // 800
  const canvasHeight = 9 * 50; // 450
  const FPS = 30;
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new Canvas(canvasWidth, canvasHeight, canvasRef.current);
    setcanvasObj(canvas);
    const bird = new Bird(
      { x: 0.1 * canvasWidth, y: 0.1 * canvasHeight },
      "yellow"
    );
    setbirdObj(bird);
    document.addEventListener("keydown", (e) => {
      bird.velocity.y = -0.25;
    });
  }, [canvasHeight, canvasRef, canvasWidth]);

  function draw(deltaTime: number) {
    if (bird?.dead) {
      // alert("bird is dead!");
      console.log("bird is dead!");
      return;
    }
    canvasObj?.setBackgroundColor("black");
    
    for(const pipe of pipes){
      pipe.draw(canvasObj);
    }
    bird?.draw(canvasObj);
    bird?.update(deltaTime, canvasObj);
    for(const pipe of pipes){
      pipe.update(deltaTime,canvasObj);
    }
  }
  let lastTime = 0;
  function animate(timestamp: number) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (!isNaN(deltaTime)) {
      draw(deltaTime);
    }

    setTimeout(() => {
      requestAnimationFrame(animate);
    }, 1 / (FPS * 1000));
  }
  animate(lastTime);
  return (
    <>
      <canvas ref={canvasRef}></canvas>
      {/* <button onClick={}>Start</button> */}
    </>
  );
}
