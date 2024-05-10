import { Matrix } from "./matrix";

export class Layer{

    id: string;
    clone(): Layer {
        throw new Error("Method not implemented.");
    }
    constructor(id : string){
        this.id = id;
    }
    forward(input : Matrix) : Matrix {
        throw new Error("Method not implemented.");
    }
    mutate(mutationRate : number) {
        throw new Error("Method not implemented.");
    }
}

export class Dense extends Layer{
    weights: Matrix;
    biases: Matrix;
    nInputs: number;
    nOutputs: number;
    constructor(nInputs: number, nOutputs: number){
        super("DENSE");
        this.nInputs = nInputs;
        this.nOutputs = nOutputs;
        this.weights = new Matrix(nOutputs,nInputs,true);
        this.biases = new Matrix(nOutputs,1,true);
    }
    forward(input : Matrix){
        return this.weights.mult(input).add(this.biases);
    }
    clone(){
        const clone = new Dense(this.nInputs,this.nOutputs);
        clone.weights = this.weights.clone();
        clone.biases = this.biases.clone();
        return clone;
    }
    mutate(mutationRate : number) {
        this.weights = this.weights.map((x,i,j)=> x*(1+mutationRate))
        this.biases = this.biases.map((x,i,j)=> x*(1+mutationRate))
    }
}

export class Sigmoid extends Layer{
    constructor(){
        super("SIGMOID");
    }
    static sigmoid(x: number){
        return 1 / (1 + Math.exp(-x));
    }
    forward(input : Matrix){
        return input.map((x,i,j)=>Sigmoid.sigmoid(x));
    }
    clone(){
        return new Sigmoid();
    }
    mutate(mutationRate : number) {
        
    }
}

export class ReLU extends Layer{
    constructor(){
        super("RELU");
    }
    static relu(x: number){
        return Math.max(0,x);
    }
    forward(input : Matrix){
        return input.map((x,i,j)=>ReLU.relu(x));
    }
    clone(){
        return new ReLU();
    }
    mutate(mutationRate : number) {
        
    }
}

export class NeuralNetwork{
    
    network: Layer[];
    constructor(){
        this.network = [];
    }
    forward(input : Matrix) : Matrix{
        let output = input;
        for(let layer of this.network){
            output = layer.forward(output);
        }
        return output;
    }
    clone() : NeuralNetwork {
        const clone = new NeuralNetwork();
        for(let layer of this.network){
            clone.network.push(layer.clone());
        }
        return clone;
    }
    mutate(mutationRate : number) {
        for(let layer of this.network){
            layer.mutate(mutationRate);
        }
    }
}