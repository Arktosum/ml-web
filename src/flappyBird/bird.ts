import { Canvas } from "../../canvas-library/canvas"
import { Matrix } from "../../ml-library/matrix"
import { Dense, NeuralNetwork, ReLU, Sigmoid } from "../../ml-library/neural"
import { GAEntity } from "./ga"
import { Pipe } from "./pipe"

export type vec2 = {
    x : number
    y : number
}
export class Bird implements GAEntity{
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
    score : number
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
      this.jumpTimeout =  200 ; // ms;
  
      this.birthTime = Date.now();
      this.deathTime = Date.now();
      this.brain = new NeuralNetwork();
  
      this.brain.network = [
        new Dense(4,2),
        new ReLU(),
        new Dense(2,1),
        new Sigmoid()
      ]
      this.score = 0;
  
    }
    mutate(mutationRate : number){
        this.brain.mutate(mutationRate);
    }
    clone(){
        const child = new Bird({x : this.context.width*0.1,y:this.context.height/2},'yellow',20,this.context);
        child.brain = this.brain.clone();
        return child;
    }
    die(){
      this.deathTime = Date.now();
      this.dead = true;
      this.score += (this.deathTime - this.birthTime)/1000;
      // location.reload();
    }
    think(closestPipe : Pipe){
        if(this.dead) return;
        const yPos = this.position.y;
        const yVel = this.velocity.y;
        const xDist = Math.sqrt(((closestPipe.position.x + closestPipe.width/2) - this.position.x)**2)
        const yDist = Math.sqrt(((closestPipe.position.y + closestPipe.topHeight + closestPipe.gap/2) - this.position.y)**2)

        this.context.drawLine((closestPipe.position.x + closestPipe.width/2),(closestPipe.position.y + closestPipe.topHeight + closestPipe.gap/2),this.position.x,this.position.y,'black',0.1)
        const birdInputMatrix = new Matrix(4,1);
        birdInputMatrix.data = [[yPos],[yVel],[xDist],[yDist]]
        const prediction = this.brain.forward(birdInputMatrix);
        const shouldJump = prediction.data[0][0] >= 0.5;
        if(shouldJump) this.jump();
    }
    jump(){
      let currentTime = Date.now();
      if (currentTime - this.lastJumped < this.jumpTimeout) return;
      this.velocity.y -= 0.3;
      this.lastJumped = currentTime;
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
      if(collision) {
        this.score -= 50; // Penalty for hitting pipe
        this.die();
      }
    }
    update(deltaTime : number){
      if(this.dead) return;
      this.position.y += this.velocity.y * deltaTime;
      this.velocity.y += this.gravity.y * deltaTime;
  
      if(!this.context.inCanvasBounds(this.position.x,this.position.y + this.radius) || 
      !this.context.inCanvasBounds(this.position.x,this.position.y - this.radius)){
        this.score -= 200; // Penalty for hitting canvas bounds
        this.die();
        return;
      }
    }
    draw() {
      if(this.dead) this.color = 'red';
      this.context.drawCircle(this.position.x,this.position.y,this.radius,this.color)
    }
  }