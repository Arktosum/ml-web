
export class Canvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(width: number, height: number, canvasElement: HTMLCanvasElement) {
      this.canvas = canvasElement;
      this.canvas.width = width;
      this.canvas.height = height;
      this.context = this.canvas.getContext("2d");
      document.body.appendChild(this.canvas);
    }
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawRect(
      x: number,
      y: number,
      width: number,
      height: number,
      color: string | CanvasGradient | CanvasPattern
    ) {
      this.context.fillStyle = color;
      this.context.fillRect(x, y, width, height);
    }
  
    drawCircle(
      x: number,
      y: number,
      radius: number,
      color: string | CanvasGradient | CanvasPattern
    ) {
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, 2 * Math.PI);
      this.context.fillStyle = color;
      this.context.fill();
    }
  
    drawLine(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string | CanvasGradient | CanvasPattern,
      lineWidth = 1
    ) {
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.strokeStyle = color;
      this.context.lineWidth = lineWidth;
      this.context.stroke();
    }
  
    setTextStyle(
      font: string,
      textAlign: CanvasTextAlign,
      textBaseline: CanvasTextBaseline,
      color: string | CanvasGradient | CanvasPattern
    ) {
      this.context.font = font;
      this.context.textAlign = textAlign;
      this.context.textBaseline = textBaseline;
      this.context.fillStyle = color;
    }
  
    drawText(text: string, x: number, y: number) {
      this.context.fillText(text, x, y);
    }
  
    setBackgroundColor(color: string | CanvasGradient | CanvasPattern) {
      this.drawRect(0, 0, this.canvas.width, this.canvas.height, color);
    }
  }