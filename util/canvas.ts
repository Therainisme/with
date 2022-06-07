export type Type = "stroke" | "fill";

/**
 * 
 * @param ctx 
 * @param fromX 起点
 * @param fromY 起点
 * @param toX 终点
 * @param toY 终点
 * @param color 颜色
 */
export function drawLine(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color?: string,
) {
    const line = new Path2D();
    line.moveTo(fromX, fromY);
    line.lineTo(toX, toY);

    ctx.stroke(line);
    if (color) ctx.strokeStyle = color;
}

/**
 * 
 * @param ctx 
 * @param x 圆心 x
 * @param y 圆心 y
 * @param radius 半径
 * @param color 颜色
 */
export function drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, radius: number,
    color?: string
) {
    const circle = new Path2D();
    // x, y, radius, startAngle, endAngle
    circle.arc(x, y, radius, 0, 2 * Math.PI);

    if (color) ctx.fillStyle = color;
    ctx.fill(circle);
}