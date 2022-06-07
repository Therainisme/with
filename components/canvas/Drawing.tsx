import { useEffect, useRef, useState } from "react";

export default function Drawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseTime, setBaseTime] = useState(() => new Date());

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

    const line = new Path2D();
    line.moveTo(30, 30); // start x, y
    line.lineTo(250, 30); // end x, y
    ctx.stroke(line);

    const CA = new Path2D();
    // x, y, radius, startAngle, endAngle
    CA.arc(30, 30, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(52, 172, 224)";
    ctx.fill(CA);


    const CB = new Path2D();
    CB.arc(250, 30, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#00b894";
    ctx.fill(CB);

    // small circle
    // x range from 55 to 225
    ctx.save();

    const time = new Date();
    const period = 4000; // milliseconds
    const xRange = 170;
    const dTime = (time.getTime() - baseTime.getTime()) % period;
    const dx = (dTime * xRange / period);
    ctx.translate(dx, 0);

    const Cmid = new Path2D();
    Cmid.arc(55, 30, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(52, 172, 224)";
    ctx.fill(Cmid);

    ctx.restore();
    requestAnimationFrame(draw);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <canvas ref={canvasRef}>
    </canvas >
  );
}