import {Matrix} from './matrix'

export class Dense {
    weights: Matrix;
    biases: Matrix;
    input: Matrix;
    constructor(inputSize: number, outputSize: number) {
        // Initialize weights and biases randomly
        this.weights = Matrix.randomNormal(outputSize, inputSize);
        this.biases = new Matrix(outputSize, 1,0); // initialize biases with 0.0 is the most common way. start with an unbiased network.
        this.input = new Matrix(inputSize, 1); // Just for the unassigned lerror to go away
    }
    forward(input: Matrix): Matrix {
        // Perform feedforward operation: output = weights * input + biases
        this.input = input;
        const output = this.weights.mult(input).add(this.biases);
        return output;
    }
    backward(gradient: Matrix,learningRate:number): Matrix {
        const weightGradient = gradient.mult(this.input.transpose());
        const biasGradient = gradient;

        const inputGradient = this.weights.transpose().mult(gradient);

        // Update weights and biases
        this.weights = this.weights.sub(weightGradient.mult(learningRate));
        this.biases = this.biases.sub(biasGradient.mult(learningRate));

        return inputGradient;
    }

}

export class ReLU {
    input: Matrix;
    constructor(){
        this.input = new Matrix(0, 0); // Just for the unassigned lerror to go away
    }
    static apply(matrix: Matrix): Matrix {
        return matrix.map((value: number) => Math.max(0, value));
    }

    static derivative(matrix: Matrix): Matrix {
        return matrix.map((value: number) => value > 0 ? 1 : 0);
    }

    forward(input: Matrix): Matrix{
        this.input = input;
        return ReLU.apply(this.input);
    }
    backward(gradient: Matrix,learningRate:number): Matrix{
        const activationGradient = ReLU.derivative(this.input).map((value, i, j) => value * gradient.data[i][j]);
        return activationGradient;
    }
}


export class Sigmoid {
    input: Matrix;
    constructor(){
        this.input = new Matrix(0, 0); // Just for the unassigned lerror to go away
    }
    static apply(matrix: Matrix): Matrix {
        return matrix.map((value: number) => Math.max(0, value));
    }

    static derivative(matrix: Matrix): Matrix {
        return matrix.map((value: number) => value > 0 ? 1 : 0);
    }
    forward(input: Matrix): Matrix{
        this.input = input;
        return ReLU.apply(this.input);
    }
    backward(gradient: Matrix,learningRate:number): Matrix{
        const activationGradient = ReLU.derivative(this.input).map((value, i, j) => value * gradient.data[i][j]);
        return activationGradient;
    }
}
