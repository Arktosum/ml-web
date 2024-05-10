import { Canvas } from "../../canvas-library/canvas"
import { vec2 } from "./bird"

export class Pipe{
    width: number
    topHeight: number
    bottomHeight!: number
    ctx: Canvas
    color: string
    topPosition!: vec2
    bottomPosition!: vec2
    gap: number
    position: vec2
    velocity: vec2
    constructor(position: vec2 , width: number,gap : number,color : string ,ctx : Canvas){
      this.width = width;
      this.gap = gap;
      this.position = position;
      this.ctx = ctx
      this.color = color;
      this.topHeight = Math.floor(Math.random()*ctx.height/2)
      this.velocity = {
        x : -0.1,
        y : 0
      }
      this.topPosition = this.position;
      this.bottomPosition = { x : this.position.x, y : this.topHeight + this.gap}
      this.bottomHeight = this.ctx.height - this.topHeight - this.gap;
    }
    update(deltaTime : number){
      this.position.x += this.velocity.x * deltaTime;
    }
    draw(){
      this.topPosition = this.position;
      this.bottomPosition = { x : this.position.x, y : this.topHeight + this.gap}
      this.bottomHeight = this.ctx.height - this.topHeight - this.gap;
  
      this.ctx.drawRect(this.topPosition.x,this.topPosition.y,this.width,this.topHeight,this.color);
      this.ctx.drawRect(this.bottomPosition.x,this.bottomPosition.y,this.width,this.bottomHeight,this.color);
    }
    
  }