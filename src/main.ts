import './style.css'
import {Canvas} from '../canvas-library/canvas'
import { Bird } from './flappyBird/bird';
import { Pipe } from './flappyBird/pipe';
import { GeneticAlgorithm } from './flappyBird/ga';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="my-canvas"></canvas>
`

const SCALE = 50;
const WIDTH = 16 * SCALE;
const HEIGHT = 9 * SCALE;
const canvas : HTMLCanvasElement | null = document.querySelector('#my-canvas');
const ctx = new Canvas(WIDTH,HEIGHT,canvas);
const POPULATION = 1000;

const geneticAlgorithm = new GeneticAlgorithm(POPULATION);
let BIRDS = geneticAlgorithm.population;
for(let i = 0 ; i < POPULATION ; i++){
  BIRDS.push(new Bird({x : WIDTH*0.1,y:HEIGHT/2},'yellow',20,ctx));
}

let PIPES  : Pipe[] = [];
PIPES.push(new Pipe({x : WIDTH+WIDTH*0.2,y : 0},70,150,'green',ctx));

let r = setInterval(()=>{
  PIPES.push(new Pipe({x : WIDTH+WIDTH*0.2,y : 0},70,150,'green',ctx));
},1000*4)

function loop(deltaTime : number){
  ctx.setBackgroundColor('skyblue');
  let deadCount = 0;
  for(let entity of BIRDS){
    let bird = (entity as Bird)
    let closestPipe = PIPES[0];
    let closestDistance = Infinity
    for(let pipe of PIPES){
      bird.collide(pipe);
      const xDist = (pipe.position.x + pipe.width/2) - bird.position.x
      if(xDist > 0 && xDist < closestDistance){
        closestDistance = xDist;
        closestPipe = pipe;
      }
    }
    bird.draw();
    bird.think(closestPipe);
    bird.update(deltaTime);
    if(bird.dead) deadCount++;
  }
  const deleteIndex = [];
  for(let pipe of PIPES){
    if(pipe.position.x < -100){
      const index = PIPES.indexOf(pipe);
      if(index!=-1) {
        deleteIndex.push(index); // Check if -1 just in case to see if item exists!
      }
    }
    pipe.draw();
    pipe.update(deltaTime);
  }
  for(let index of deleteIndex){
    PIPES.splice(index, 1);
    console.log('50 points to all alive birds!');
    BIRDS.forEach((entity)=>{
      let bird = entity as Bird;
      if(!bird.dead) bird.score += 50 // Crossed a pipe!
    })
  }
  if(deadCount == POPULATION){
    BIRDS = geneticAlgorithm.getnewPopulation();
    PIPES = [];
    clearInterval(r);
    PIPES.push(new Pipe({x : WIDTH+WIDTH*0.2,y : 0},70,150,'green',ctx));
    r = setInterval(()=>{
      PIPES.push(new Pipe({x : WIDTH+WIDTH*0.2,y : 0},70,150,'green',ctx));
    },1000*4)
  }
}


// document.addEventListener('keydown',(e : KeyboardEvent) => {
//   if(e.key == ' '){
//     bird.jump();
//   }
// })
  // if(bird.dead){
  //   ctx.drawText(`Score : ${(bird.deathTime - bird.birthTime)/1000}`,100,100)
  // }
  // else{
  //   ctx.drawText(`Score : ${(Date.now() - bird.birthTime)/1000}`,100,100)
  // }


const frequency = 60;
const timeInterval = 1000/frequency;

let previousTime = Date.now();
function animate(){
  requestAnimationFrame(animate);
  const currentTime = Date.now();
  const dt = currentTime - previousTime;
  if(dt >= timeInterval){
    loop(dt);
    previousTime = currentTime;
  }
}

requestAnimationFrame(animate);

console.log(ctx);