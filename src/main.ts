import './style.css'
import {Canvas} from '../canvas-library/canvas'
import {Bird, Pipe} from '../game-library/flappy'
import {GeneticAlgorithm} from '../game-library/ga'
import {NeuralCanvas} from '../game-library/neural'

const CANVAS_SCALE = 50;
const CANVAS_WIDTH = 16 * CANVAS_SCALE;
const CANVAS_HEIGHT = 9 * CANVAS_SCALE;
const CANVAS_ELEMENT = document.getElementById('my-canvas') as HTMLCanvasElement
const NEURAL_CANVAS_ELEMENT = document.getElementById('neural-canvas') as HTMLCanvasElement
const CANVAS = new Canvas(CANVAS_WIDTH,CANVAS_HEIGHT,CANVAS_ELEMENT);
const NEURAL_CANVAS = new NeuralCanvas(CANVAS_WIDTH,CANVAS_HEIGHT,NEURAL_CANVAS_ELEMENT);
const FPS = 60;

const INITIAL_BIRD_POSITION = {x: 0.1*CANVAS_WIDTH, y: 0.5*CANVAS_HEIGHT}

const birdGA = new GeneticAlgorithm(200,INITIAL_BIRD_POSITION,CANVAS);
birdGA.initializePopulation()

let pipes: Pipe[] = [] 

function addPipe(){
  let newPipe = new Pipe({x:CANVAS_WIDTH, y:0},CANVAS);
  newPipe.height = CANVAS.canvas.height*0.7*Math.random();
  newPipe.velocity.x = -2
  pipes.push(newPipe);
}
setInterval(()=>{
  addPipe();
},1000*3)

// document.addEventListener('keypress',(e: KeyboardEvent)=>{
//   bird.jump();
// })
addPipe();

async function draw(deltaTime : number){
  CANVAS.setBackgroundColor('black');
  birdGA.draw();
  let latestPipe = pipes[0];
  await birdGA.act(latestPipe);
  birdGA.update(deltaTime);
  for(let pipe of pipes){
    pipe.draw();
    pipe.update(deltaTime); 
  }
  if(latestPipe.position.x + latestPipe.width <= 0){
    pipes.shift();
    for(let bird of birdGA.population){
      if(!bird.dead) bird.pipesCrossed++;
    }
  }
  birdGA.collision(latestPipe);
  if(birdGA.isAllDead()){
    birdGA.naturalSelection();
    pipes = [];
    addPipe();
  }

  NEURAL_CANVAS.setBackgroundColor('gray');
  NEURAL_CANVAS.draw(birdGA.population.slice(-1)[0].brain);
}
let lastTime = 0;
function animate(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  if (!isNaN(deltaTime)) {
    draw(deltaTime/10);
  }
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 * (1/FPS));
}

animate(lastTime);
 
