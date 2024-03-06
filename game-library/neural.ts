import {Canvas} from '../canvas-library/canvas'
import {Network} from '../ml-library/network'

export class NeuralCanvas extends Canvas {
    constructor(width : number, height : number,canvasElement : HTMLCanvasElement){
        super(width,height,canvasElement);
    }
    draw(network: Network){
        let layerX = 200;
        let runningLayerXInd = 0;
        let layerY = 30;
        for(let layer of network.network){
            if(layer.type == 'DENSE'){
                let input = layer.weights?.shape[1];
                let output = layer.weights?.shape[0];
                
                let inputPos = [];
                let outputPos = [];
                for(let i = 0 ; i < input ; i++){
                    let pos = {x:100+runningLayerXInd*layerX,y:100+i*layerY}
                    this.drawCircle(pos.x,pos.y,10,'yellow');
                    inputPos.push(pos)
                }
                for(let j = 0 ; j < output ; j++){
                    let pos = {x:100+(runningLayerXInd+1)*layerX,y:100+j*layerY}
                    this.drawCircle(pos.x,pos.y,10,'yellow');
                    outputPos.push(pos);
                }

                for(let j =0 ; j < output ; j++){
                    for(let i = 0 ; i < input ; i++){
                        let val = layer.weights?.data[j][i];
                        this.drawLine(inputPos[i].x,inputPos[i].y,outputPos[j].x,outputPos[j].y,val < 0 ? 'red' : 'green');
                    }
                }

                runningLayerXInd++;
            }
        }
    }

}