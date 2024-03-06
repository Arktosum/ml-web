import { Canvas } from '../canvas-library/canvas';
import {Bird, Pipe, vec2} from './flappy'

export class GeneticAlgorithm{
    count: number;
    population: Bird[];
    generation: number;
    initialPosition: vec2;
    canvas: Canvas;
    champion : Bird;
    constructor(count : number,initialPosition : vec2,canvas:Canvas){
        this.count = count;
        this.population = [];
        this.generation = 1;
        this.initialPosition = initialPosition
        this.canvas = canvas;
        this.champion = new Bird(this.initialPosition,this.canvas);
    }
    initializePopulation(){
        for(let i = 0; i < this.count; i++){
            this.population.push(new Bird(this.initialPosition,this.canvas));
        }
    }
    isAllDead(){
        for(let bird of this.population){
            if(!bird.dead) return false;
        }
        return true;
    }
    calculateFitnessSum(){
        let fitnessSum = 0
        for(let bird of this.population){
            fitnessSum+=bird.fitnessScore();
        }
        return fitnessSum;
    }
    selectParent(fitnessSum:number){
        let rand = Math.random()*fitnessSum;
        let runningSum = 0;
        for(let bird of this.population){
            runningSum += bird.fitnessScore();
            if(runningSum > rand){
                return bird;
            }
        }
        console.error('something went wrong in select parent!')
        return this.population[0]; // Should never reach this!
    }
    naturalSelection(){
        if(!this.isAllDead()) return;
        let fitnessSum = this.calculateFitnessSum();
        let newPopulation = [];

        let bestBird = this.findBest();
        let bestfitness = bestBird.fitnessScore();
        let bestBirdClone = bestBird.clone();
        // Should NOT mutate Best bird because mutation might lead to degradation.
        bestBirdClone.color = 'purple';
        let championFitness = this.champion.fitnessScore();
        if(bestfitness > championFitness){
            this.champion = bestBird.clone();
        }
        else{
            this.champion = this.champion.clone();
        }
        this.champion.color = 'orange'
        for(let i = 2; i < this.count ; i++){
            let parent = this.selectParent(fitnessSum);
            let babyBird = parent.clone();
            babyBird.mutate(0.01);
            newPopulation.push(babyBird);
        }
        newPopulation.push(bestBirdClone);
        newPopulation.push(this.champion);
        console.log("------------------");
        console.log(`Generation : ${this.generation} | Best Fitness : ${bestfitness} | ChampionFitness : ${championFitness}`);
        console.log("------------------");
        this.population = newPopulation;
        this.generation++;
    }
    findBest(){
        let bestBird = this.population[0];
        let bestFitness = bestBird.fitnessScore();
        for(let bird of this.population){
            let fitness = bird.fitnessScore();
            if(fitness > bestFitness){
                bestFitness = fitness;
                bestBird = bird;
            }
        }
        return bestBird;
    }
    draw(){
        for(let bird of this.population){
            bird.draw();
        }
    }

    update(deltaTime:number){
        for(let bird of this.population){
            bird.update(deltaTime);
        }
    }
    async act(latestPipe : Pipe){
        for(let bird of this.population){
            let distanceToPipeX = latestPipe.position.x - bird.position.x;
            if(distanceToPipeX < 0){
                distanceToPipeX = 0;
            }
            let distanceToPipeCenter = (latestPipe.height + latestPipe.gap/2) - bird.position.y;
            if(distanceToPipeCenter < 0){
                distanceToPipeCenter = 0;
            }
            await bird.act(bird.position.y,distanceToPipeX,distanceToPipeCenter);
        }
    }
    collision(latestPipe : Pipe){
        for(let bird of this.population){
            if(latestPipe.collision(bird)){
                bird.kill();
            }
        }
    }
}