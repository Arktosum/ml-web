import './style.css'
import {Canvas} from '../canvas-library/canvas'
import { Bird } from './flappyBird/bird';
import { Pipe } from './flappyBird/pipe';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="my-canvas"></canvas>
`

const SCALE = 50;
const WIDTH = 16 * SCALE;
const HEIGHT = 9 * SCALE;
const canvas : HTMLCanvasElement | null = document.querySelector('#my-canvas');
const ctx = new Canvas(WIDTH,HEIGHT,canvas);


const POPULATION = 1;
const BIRDS : Bird[] = [];
for(let i = 0 ; i < POPULATION ; i++){
  BIRDS.push(new Bird({x : WIDTH*0.1,y:HEIGHT/2},'yellow',20,ctx));
}

const PIPES  : Pipe[] = [];
PIPES.push(new Pipe({x : WIDTH+WIDTH*0.2,y : 0},50,150,'green',ctx));

setInterval(()=>{
  PIPES.push(new Pipe({x : WIDTH+WIDTH*0.2,y : 0},50,150,'green',ctx));
},1000*4)

function loop(deltaTime : number){
  ctx.setBackgroundColor('black');

  for(let bird of BIRDS){
    bird.draw();
    bird.think();
    bird.update(deltaTime);
    for(let pipe of PIPES){
      bird.collide(pipe);
    }
  }
  for(let pipe of PIPES){
    pipe.draw();
    pipe.update(deltaTime);
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