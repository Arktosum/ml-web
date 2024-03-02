import {Matrix} from './matrix'

function applyStandardScale(data : number[][],mean : number,stdDev : number){
    const newData = data.slice();
    for(let i = 0; i < newData.length; i++){
      newData[i][0] = (newData[i][0] - mean)/stdDev;
    }
    return newData;
  }
  export function standardScaler(x_train : number[][], x_test : number[][]){
    // Mean and std of x_train
    let runningSum = 0
    for(const x of x_train) {
      const val = x[0]
      runningSum += val;
    }
    const x_train_mean = runningSum / x_train.length;
    let runningDev = 0.0
    for(const x of x_train) {
      const val = x[0];
      runningDev += (val - x_train_mean)**2;
    }
    const x_train_std = Math.sqrt(runningDev / x_train.length);
  
    // apply it to x_train and x_test
    const normalizedTrain = applyStandardScale(x_train, x_train_mean,x_train_std)
    const normalizedTest = applyStandardScale(x_test, x_train_mean,x_train_std);
    return [normalizedTrain, normalizedTest];
  }

export const sleep = (ms: number | undefined) => new Promise((r) => setTimeout(r, ms));
export function shuffleArrays<T, U>(array1: T[], array2: U[]): [T[], U[]] {
  /*
  Creates a new Permutation (shuffled) array.
  */
  if (array1.length !== array2.length) {
    throw new Error("Arrays must have the same length");
  }

  const shuffledArray1 = array1.slice(); // Create copies of the original arrays to avoid mutating them
  const shuffledArray2 = array2.slice();

  for (let i = shuffledArray1.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i
    // Swap elements at indices i and j in both arrays
    [shuffledArray1[i], shuffledArray1[j]] = [
      shuffledArray1[j],
      shuffledArray1[i],
    ];
    [shuffledArray2[i], shuffledArray2[j]] = [
      shuffledArray2[j],
      shuffledArray2[i],
    ];
  }

  return [shuffledArray1, shuffledArray2];
}

export function test_dataset(
    network: any[],
    x_test:  number[],
    y_test: number[][]
  ) {
    const predictions = [];
    for (let i = 0; i < x_test.length; i++) {
      const x = Matrix.fromArray([x_test[i]]);
      let y_pred = x;
      for (const layer of network) {
        y_pred = layer.forward(y_pred);
      }
      predictions.push([y_pred.data[0][0]]);
    }
    return predictions;
  }