import {Matrix} from './matrix';
import {Layer} from './layers';

import {
    shuffleArrays,
    sleep,
    standardScaler,
  } from "../ml-library/utils";

export interface EpochData{
    epoch :number,
    totalEpochs : number,
    epochLoss :number,
    test : {
        predictions : number[][],
        loss : number
    }
}
const DELAY_MS = 1;
export class Network{
    network: Layer[];
    constructor(){
        this.network = [];
    }
    async predictOne(x : Matrix) {
        let y_pred = x;
        for (const layer of this.network) {
            y_pred = layer.forward(y_pred);
        }
        return y_pred;
    }
    async test_dataset(x_test:  number[][],y_test: number[][]) : Promise<[number[][],number]>{
        const predictions : number[][] = [];
        let loss = 0;
        for (let i = 0; i < x_test.length; i++) {
          const x = Matrix.fromArray([x_test[i]]);
          const y = Matrix.fromArray([y_test[i]]);
          let y_pred = x;
          for (const layer of this.network) {
            y_pred = layer.forward(y_pred);
          }
          predictions.push([y_pred.data[0][0]]);
          const gradient = y_pred.sub(y);
          loss += gradient.pow(2).div(2).data[0][0];
        }
        loss = loss / x_test.length;
        return [predictions,loss];
    }
    async trainBatch(x_train : number[][] , y_train : number[][],x_test:number[][],y_test:number[][], epochs :number ,learning_rate : number,epochCallback: (arg0: EpochData) => void,finishedCallback: () => void){
        for (let e = 1; e <= epochs; e++) {
            let epochLoss = 0;
            const [new_x_train, new_y_train] = shuffleArrays(x_train, y_train);
            for (let i = 0; i < x_train.length; i++) {
                const x = Matrix.fromArray([new_x_train[i]]);
                const y = Matrix.fromArray([new_y_train[i]]);
                const y_pred = await this.predictOne(x);
                let gradient = y_pred.sub(y);
                epochLoss += gradient.pow(2).div(2).data[0][0];
                for (const layer of this.network.reverse()) {
                    gradient = layer.backward(gradient, learning_rate);
                }
                this.network.reverse();
            }
            epochLoss = epochLoss / x_train.length;
            if (isNaN(epochLoss)) {
                throw new Error("Loss reached infinity!");
            }
            const [test_predictions,test_loss] = await this.test_dataset(x_test, y_test);
            // const showString = `Epoch : ${e}/${epochs} | Loss : ${epochLoss}` + (showTraining ? ` | Test Loss : ${testLoss}`:'')
            epochCallback({epoch : e , totalEpochs : epochs, epochLoss,test:{predictions : test_predictions,loss:test_loss}} as EpochData);
            await sleep(1);    
        }
            // const [testPredictions,loss] = this.test_dataset( x_test, y_test);
            finishedCallback();
        }
        
    }

