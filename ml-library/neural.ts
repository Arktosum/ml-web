import { Matrix } from "./matrix";

export class Layer{
    forward(input : Matrix) : Matrix {
        return new Matrix(0,0)
    }
}

export class Dense extends Layer{
    weights: Matrix;
    biases: Matrix;
    constructor(nInputs: number, nOutputs: number){
        super();
        this.weights = new Matrix(nOutputs,nInputs);
        this.biases = new Matrix(nInputs,nOutputs);
    }
    forward(input : Matrix){
        return this.weights.mult(input).add(this.biases);
    }
}

export class Sigmoid extends Layer{
    constructor(){
        super();
    }
    static sigmoid(x: number){
        return 1 / (1 + Math.exp(-x));
    }
    forward(input : Matrix){
        return input.map((x,i,j)=>Sigmoid.sigmoid(x));
    }
}

export class ReLU{
    static relu(x: number){
        return Math.max(0,x);
    }
    forward(input : Matrix){
        return input.map((x,i,j)=>ReLU.relu(x));
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
}