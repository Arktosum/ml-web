
import { Canvas } from "../canvas-library/canvas";
import { Dense, ReLU, Sigmoid } from "../ml-library/layers";
import { Matrix } from "../ml-library/matrix";
import { Network } from "../ml-library/network";
export interface vec2{
  x : number;
  y : number;
}

export class Bird{
  position: vec2;
  canvas: Canvas;
  radius: number;
  color: string;
  velocity: vec2
  gravity: number;
  dead: boolean;
  pipesCrossed: number;
  lifeTime: { birthTime: number; deathTime: number; };
  pipeCrossPoint: number;
  brain: Network;
  initialPosition: vec2;
  constructor(initialPosition : vec2,canvas : Canvas){
    this.initialPosition = initialPosition
    this.position = {x: initialPosition.x, y: initialPosition.y};
    this.canvas = canvas;
    this.radius = 20;
    this.color = 'yellow';
    this.velocity = {x : 0 , y : 0};
    this.gravity = 0.1;
    this.dead = false;


    this.pipesCrossed = 0;
    this.pipeCrossPoint = 20;
    this.lifeTime = {birthTime : Date.now() , deathTime : -1}

    this.brain = new Network();
    this.brain.network = [new Dense(3,5),new ReLU(),new Dense(5,1),new Sigmoid()];
    // 
  }

  clone(){
    // Gives the exact copy of this bird
    let babyBird = new Bird(this.initialPosition,this.canvas);
    this.brain.network=[]
    for(let layer of this.brain.network){
      if(layer.type == 'DENSE'){
        let dense = new Dense(layer.weights?.rows,layer.weights?.cols);
        dense.weights = layer.weights?.clone();
        dense.biases = layer.biases?.clone();
        babyBird.brain.network.push(dense);
      }
      if(layer.type == 'RELU'){
        let relu = new ReLU();
        babyBird.brain.network.push(relu);
      }
      if(layer.type == 'SIGMOID'){
        let sigmoid = new Sigmoid();
        babyBird.brain.network.push(sigmoid);
      }
    }
    return babyBird;
  }
  mutate(mutationRate : number){
    for(let layer of this.brain.network){
      if(layer.type == 'DENSE'){
        layer.weights.map((weight,row,col)=>{
          let rand = Math.random();
          if(rand < mutationRate){
            return weight*Math.random();
          }
          return weight;
        })
        layer.biases.map((bias,row,col)=>{
          let rand = Math.random();
          if(rand < mutationRate){
            return bias*Math.random();
          }
          return bias;
        })
      }
    }
  }
  fitnessScore(){
    let timeScore
    if(this.lifeTime.deathTime == -1){
      timeScore = (Date.now() - this.lifeTime.birthTime)/1000;
    }
    else{
      timeScore = (this.lifeTime.deathTime - this.lifeTime.birthTime)/1000;
    }
    return this.pipesCrossed*this.pipeCrossPoint+ timeScore;
  }
  async act(birdYPos : number , distToPipeX : number , distToPipeCenterY : number){
    let inputVector = Matrix.fromArray([[birdYPos],[distToPipeX],[distToPipeCenterY]]);
    let outputVector = await this.brain.predictOne(inputVector);
    let shouldJump = outputVector.data[0][0];
    if(shouldJump > 0.5){
      this.jump();
    }
  }
  jump(){
    if(this.dead) return;
    this.velocity.y = -1.5;
  }
  draw(){
    this.canvas.drawCircle(this.position.x, this.position.y, this.radius,this.color);
  }
  kill(){
    if(this.dead) return;
    this.color = '#ff00000f'
    this.lifeTime.deathTime = Date.now();
    this.dead = true;
    
  }
  update(deltaTime:number){
    if(this.dead) return;
    this.velocity.y += this.gravity ;
    this.position.y += this.velocity.y ;

    let up = {x : this.position.x , y : this.position.y - this.radius}
    let down = {x : this.position.x , y : this.position.y + this.radius }
    let right = {x : this.position.x + this.radius , y : this.position.y };

    if((up.y <= 0) || (down.y >= this.canvas.canvas.height)){
      this.kill();
    }
  }
}


export class Pipe{
  position: vec2;
  canvas: Canvas;
  color: string;
  velocity: { x: number; y: number; };
  width: number;
  height: number;
  gap: number;
  constructor(initialPosition : vec2,canvas : Canvas){
    this.position = initialPosition;
    this.canvas = canvas;
    this.color = 'green';
    this.velocity = {x : -1 , y : 0}
    this.width = 70;
    this.height = 50;
    this.gap = 125;
    
  }
  update(deltaTime:number){
    this.position.x += this.velocity.x * deltaTime;
  }
  draw(){
    let bottomHeight = this.canvas.canvas.height - (this.height  + this.gap)
    // top pipe
    this.canvas.drawRect(this.position.x, this.position.y, this.width,this.height,this.color);
    this.canvas.drawRect(this.position.x, this.height + this.gap, this.width,bottomHeight,this.color);
  }
  collision(bird : Bird){
    // Bird can hit left side , inner top and inner bottom only
    let up = {x : bird.position.x , y : bird.position.y - bird.radius}
    let down = {x : bird.position.x , y : bird.position.y + bird.radius }
    let right = {x : bird.position.x + bird.radius , y : bird.position.y };

    let bottomHeight = this.canvas.canvas.height - (this.height  + this.gap)

    // top with bird up
    let top = rectangularCollision(this.position,this.width,this.height,up);
    // bottom with bird down
    let bottom = rectangularCollision({x:this.position.x,y:this.height + this.gap},this.width,bottomHeight,down);

    // top and bottom with bird right
    let topLeft = rectangularCollision(this.position,this.width,this.height,right);
    // bottom with bird down
    let bottomLeft = rectangularCollision({x:this.position.x,y:this.height + this.gap},this.width,bottomHeight,right);
    
    return top || bottom || topLeft || bottomLeft
  }

}

function rectangularCollision(pos : vec2,width: number,height : number,checkPos : vec2){
  let checkX = (pos.x <= checkPos.x) && (checkPos.x <= (pos.x + width));
  let checkY = (pos.y <= checkPos.y) && (checkPos.y <= (pos.y + height));
  return (checkX && checkY);
}