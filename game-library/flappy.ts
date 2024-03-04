import { Canvas } from "../canvas-library/canvas";

export interface vec2 {
    x: number;
    y: number;
}
  
export class Pipe {
    position: vec2;
    color: string;
    velocity: { x: number; y: number };
    width: number;
    height: number;
    constructor(initialPosition: vec2, color: string) {
      this.position = initialPosition;
      this.color = color;
      this.velocity = { x: -0.1, y: 0 };
      this.width = 10;
      this.height = 50;
    }
    update(deltaTime: number, canvas: Canvas | null) {
        if(!canvas) return;

        this.position.x += this.velocity.x * deltaTime;
    }
    draw(canvas: Canvas | null) {
      // Top pipe
      canvas?.drawRect(
        this.position.x,
        this.position.y,
        this.position.x + this.width,
        this.position.y + this.height,
        this.color
      );
    }
  }
export class Bird {
    position: vec2;
    color: string;
    velocity: vec2;
    gravity: number;
    dead: boolean;
    radius: number;
    constructor(initialPosition: vec2, color: string) {
      this.position = initialPosition;
      this.color = color;
      this.velocity = { x: 0, y: 0 };
      this.gravity = 0.001;
      this.radius = 20;
      this.dead = false;
    }
    update(deltaTime: number, canvas: Canvas | null) {
      if (this.dead) return;
      if(!canvas) return;
      this.velocity.y += this.gravity * deltaTime;
  
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
  
      if (
        this.position.y + this.radius >= canvas?.canvas.height ||
        this.position.y - this.radius <= 0
      ) {
        this.dead = true;
      }
    }
    draw(canvas: Canvas | null) {
    if(!canvas) return;
      canvas.drawCircle(this.position.x, this.position.y, this.radius, "yellow");
    }
  }