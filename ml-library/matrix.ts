export class Matrix {
    rows: number;
    cols: number;
    data: number[][];
    shape : [number,number];
    constructor(rows: number, cols: number, initialValue: number = 0) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = initialValue;
            }
        }
        this.shape = [this.rows,this.cols]
    }
    print() {
        console.log(`Shape : (${this.rows},${this.cols})`)
        console.table(this.data);
    }
    static fromArray(arr: number[][]): Matrix {
        const rows = arr.length;
        const cols = arr[0].length;
        const matrix = new Matrix(rows, cols);
        matrix.data = arr;
        return matrix;
    }

    static randomNormal(rows: number, cols: number): Matrix {
        const matrix = new Matrix(rows, cols);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Using Box-Muller transform to generate values from standard normal distribution
                let u = 0, v = 0;
                while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
                while (v === 0) v = Math.random();
                const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
                matrix.data[i][j] = z0; // Storing the generated value in the matrix
            }
        }
        return matrix;
    }

    add(other: number | Matrix): Matrix {
        if (typeof other === 'number') {
            return this.map((value: number) => value + other);
        } else {
            if (this.rows !== other.rows || this.cols !== other.cols) {
                throw new Error('Matrix dimensions must match');
            }
            return this.map((value: number, i: number, j: number) => value + other.data[i][j]);
        }
    }

    sub(other: number | Matrix): Matrix {
        if (typeof other === 'number') {
            return this.map((value: number) => value - other);
        } else {
            if (this.rows !== other.rows || this.cols !== other.cols) {
                throw new Error('Matrix dimensions must match');
            }
            return this.map((value: number, i: number, j: number) => value - other.data[i][j]);
        }
    }

    mult(other: number | Matrix): Matrix {
        if (typeof other === 'number') {
            return this.map((value: number) => value * other);
        } else {
            if (this.cols !== other.rows) {
                throw new Error('Number of columns in first matrix must match number of rows in second matrix');
            }
            const result = new Matrix(this.rows, other.cols);
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < other.cols; j++) {
                    let sum = 0;
                    for (let k = 0; k < this.cols; k++) {
                        sum += this.data[i][k] * other.data[k][j];
                    }
                    result.data[i][j] = sum;
                }
            }
            return result;
        }
    }

    div(other: number | Matrix): Matrix {
        if (typeof other === 'number') {
            if (other === 0) {
                throw new Error('Division by zero');
            }
            return this.map((value: number) => value / other);
        } else {
            throw new Error('Matrix division is not supported');
        }
    }

    pow(exponent: number): Matrix {
        return this.map((value: number) => Math.pow(value, exponent));
    }

    map(callback: (value: number, row: number, col: number) => number): Matrix {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.data[i][j] = callback(this.data[i][j], i, j);
            }
        }
        return result;
    }

    reshape(rows: number, cols: number): Matrix {
        if (rows * cols !== this.rows * this.cols) {
            throw new Error('New shape must have the same number of elements as the original matrix');
        }
        const result = new Matrix(rows, cols);
        let dataIdx = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result.data[i][j] = this.data[Math.floor(dataIdx / this.cols)][dataIdx % this.cols];
                dataIdx++;
            }
        }
        return result;
    }
    clone() : Matrix {
        return this.map((value,row,col)=>value);
    }
    transpose(): Matrix {
        const result = new Matrix(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.data[j][i] = this.data[i][j];
            }
        }
        return result;
    }
}

