import {Matrix} from './matrix'
export class Layer{
    input: Matrix;
    weights? : Matrix;
    biases? : Matrix;
    type : string
    constructor(){
        this.input = new Matrix(0,0);
        this.type = 'LAYER'
    }
    forward(input : Matrix) : Matrix{
        return input
    }
    backward(gradient:Matrix,learning_rate:number):Matrix{
        return gradient;
    }
}

export class Dense extends Layer{
    weights: Matrix;
    biases: Matrix;
    input: Matrix;
    constructor(inputSize: number, outputSize: number) {
        super();
        // Initialize weights and biases randomly
        this.weights = Matrix.randomNormal(outputSize, inputSize);
        this.biases = new Matrix(outputSize, 1,0); // initialize biases with 0.0 is the most common way. start with an unbiased network.
        this.input = new Matrix(inputSize, 1); // Just for the unassigned lerror to go away

        this.type = 'DENSE'
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

export class ReLU extends Layer{
    constructor(){
        super();
        this.type = 'RELU'
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


export class Sigmoid extends Layer {
    constructor(){
        super();
        this.type = 'SIGMOID'
    }
    static sigmoid(x:number){
        return 1 / (1+Math.exp(-x))
    }
    static sigmoid_prime(x:number){
        let s = Sigmoid.sigmoid(x);
        return s * (1-s);
    }
    static apply(matrix: Matrix): Matrix {
        return matrix.map((value: number) => Sigmoid.sigmoid(value));
    }
    static derivative(matrix: Matrix): Matrix {
        return matrix.map((value: number) => Sigmoid.sigmoid_prime(value));
    }
    forward(input: Matrix): Matrix{
        this.input = input;
        return Sigmoid.apply(this.input);
    }
    backward(gradient: Matrix,learningRate:number): Matrix{
        const activationGradient = Sigmoid.derivative(this.input).map((value, i, j) => value * gradient.data[i][j]);
        return activationGradient;
    }
}
