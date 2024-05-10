export interface GAEntity{
    clone(): GAEntity;
    mutate(mutationRate : number): void;
    score: number;
}
export class GeneticAlgorithm{
    POPULATION_COUNT: number;
    population: GAEntity[];
    mutationRate: number;
    generation: number;
    champion: GAEntity | null;
    constructor(POPULATION_COUNT : number){
        this.POPULATION_COUNT = POPULATION_COUNT
        this.population = [];
        this.mutationRate = 0.3;
        this.generation = 0;
        this.champion = null;
    }
    rouletteSelect() : GAEntity | null{
        // Roulette Wheel of fitness probabilities.

        // Normalize weights to make them non-negative
        const weights = this.population.map((item)=>item.score)
        const minWeight = Math.min(...weights);
        const normalizedWeights = weights.map(weight => weight - minWeight);
        // Calculate total normalized weight
        const fitnessSum = normalizedWeights.reduce((acc, val) => acc + val, 0);
        // Edge case: If all weights are zero, return -1
        if (fitnessSum === 0) {
            console.error("Something went wrong in roulette select! All weights are zero!");
            return null;
        }
        const randomValue = Math.random() * fitnessSum;
        let cumulativeWeight = 0;
        for (let i = 0; i < normalizedWeights.length; i++) {
            cumulativeWeight += normalizedWeights[i];
            if (randomValue <= cumulativeWeight) {
                return this.population[i];
            }
        }
        console.error("Something went wrong in roulette select!");
        return null;
    }
    getnewPopulation(){
        const newPopulation = [];


        if(!this.champion){
            this.champion = this.population[0];
        }
        for(let entity of this.population){
            if(entity.score > this.champion.score){
                this.champion = entity;
            }
        }
        const newChampion = this.champion.clone();
        newChampion.mutate(this.mutationRate);
        newPopulation.push(newChampion);
        newChampion.color = 'blue';
        const scores = this.population.map((item)=>item.score) ;
        for(let i = 0; i < this.POPULATION_COUNT-1; i++) {
            
            const select = this.rouletteSelect();
            if(select != null){
                const newEntity = select.clone();
                newEntity.mutate(this.mutationRate);
                newPopulation.push(newEntity);
            }
        }
        const averageScore = scores.reduce((acc,score)=>acc+score,0) / this.population.length;
        const bestScore = Math.max(...scores);
        const leastScore = Math.min(...scores);
        this.generation++;
        console.log(`Generation ${this.generation} Champion score : ${this.champion.score} | Best score : ${bestScore} | Average score : ${averageScore} | Least Score : ${leastScore}`);
        this.population = newPopulation;
        return newPopulation;
    }
}