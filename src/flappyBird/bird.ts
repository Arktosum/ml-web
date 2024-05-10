import { Canvas } from "../../canvas-library/canvas"
import { Dense, NeuralNetwork, ReLU, Sigmoid } from "../../ml-library/neural"
import { Pipe } from "./pipe"

export type vec2 = {
    x : number
    y : number
}
export class Bird{
    position: vec2
    velocity: vec2
    color: string
    radius: number
    context: Canvas
    dead: boolean
    gravity: vec2
    lastJumped: number
    jumpTimeout: number
    birthTime: number
    deathTime: number
    brain: NeuralNetwork
    constructor(position : vec2 ,color : string,radius : number,context : Canvas){
      this.position = position
      this.color = color
      this.radius = radius;
      this.context = context
      this.dead = false;
      this.velocity = {
        x : 0,
        y : 0
      }
      this.gravity = {
        x : 0,
        y : 0.001
      }
      this.lastJumped = Date.now();
      this.jumpTimeout =  100 ; // ms;
  
      this.birthTime = Date.now();
      this.deathTime = Date.now();
      this.brain = new NeuralNetwork();
  
      this.brain.network = [
        new Dense(4,5),
        new ReLU(),
        new Dense(5,1),
        new Sigmoid()
      ]
  
    }
    die(){
      this.deathTime = Date.now();
      this.dead = true;
      // location.reload();
    }
    think(){
  
    }
    jump(){
      let currentTime = Date.now();
      if (currentTime - this.lastJumped < this.jumpTimeout) return;
      this.velocity.y -= 0.5;
    }
    rectangularCollision(px:number,py:number,x:number,y:number,width:number,height:number){
      return (x<=px) && (px<=(x+width)) && (y<=py)&&(py<=(y+height));
    }
    collide(pipe : Pipe){
      if(this.dead) return;
      let collision = false; 
      const top = {x : this.position.x , y : this.position.y - this.radius}
      const right = {x : this.position.x + this.radius, y : this.position.y}
      const bottom = {x : this.position.x , y : this.position.y + this.radius}
      const points = [top, bottom, right]   
      for(let point of points){
        if (this.rectangularCollision(point.x,point.y,pipe.topPosition.x,pipe.topPosition.y,pipe.width,pipe.topHeight) ||
           (this.rectangularCollision(point.x,point.y,pipe.bottomPosition.x,pipe.bottomPosition.y,pipe.width,pipe.bottomHeight))){
          collision = true;
          break;
        };
      }
      if(collision) this.die();
    }
    update(deltaTime : number){
      if(this.dead) return;
      this.position.y += this.velocity.y * deltaTime;
      this.velocity.y += this.gravity.y * deltaTime;
  
      if(!this.context.inCanvasBounds(this.position.x,this.position.y + this.radius) || 
      !this.context.inCanvasBounds(this.position.x,this.position.y - this.radius)){
        this.die();
        return;
      }
    }
    draw() {
      if(this.dead) this.color = 'red';
      this.context.drawCircle(this.position.x,this.position.y,this.radius,this.color)
    }
  }