import { useEffect, useRef, useState } from "react";
import { drawCircle, drawLine } from "util/canvas";

export default function Drawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseTime, setBaseTime] = useState(() => new Date());
  const [colorA, setColorA] = useState("rgb(52, 172, 224)");
  const [colorB, setColorB] = useState("#00b894");

  function init() {
    requestAnimationFrame(draw);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas?.getContext) {
      return;
    }
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    const time = new Date();
    const period = 3000; // milliseconds
    const xRange = 340;
    const dTime = (time.getTime() - baseTime.getTime()) % period;
    const dx = (dTime * xRange / period);

    const reverse = (Math.floor((time.getTime() - baseTime.getTime()) / period)) % 2 === 0;

    if (reverse) {
      drawCircle(ctx, 60, 60, 50, colorA);
      drawCircle(ctx, 500, 60, 50, colorB);
    } else {
      drawCircle(ctx, 60, 60, 50, colorB);
      drawCircle(ctx, 500, 60, 50, colorA);
    }

    // small circle
    // x range from 110 to 450
    ctx.save();

    if (reverse) {
      ctx.translate(dx, 0);
      drawCircle(ctx, 110, 60, 10, colorA);
    } else {
      ctx.translate(340 - dx, 0);
      drawCircle(ctx, 110, 60, 10, colorB);
    }

    ctx.restore();
    ctx.fillStyle = "black";
    ctx.font = '32px sans serif';
    ctx.textAlign = "center";
    ctx.fillText("这是一个简单的小球", 280, 200);

    requestAnimationFrame(draw);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <canvas ref={canvasRef} width={600} height={300} style={{ width: 300, height: 150 }}>
    </canvas >
  );
}