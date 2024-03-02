import "./App.css";
import { Matrix } from "../ml-library/matrix";
import { Dense, ReLU } from "../ml-library/dense";
import {
  shuffleArrays,
  sleep,
  standardScaler,
  test_dataset,
} from "../ml-library/utils";
import { useRef, useEffect, useState, SetStateAction } from "react";

const DELAY_MS = 1;
async function train(
  network: any[],
  x_train: any[],
  y_train: any[],
  epochs: number,
  learning_rate: number,
  setypredvalues: {
    (value: SetStateAction<number[][]>): void;
    (arg0: number[][]): void;
  },
  x_test: any[],
  y_test: any[]
) {
  for (let e = 0; e < epochs; e++) {
    let epochLoss = 0;

    const [new_x_train, new_y_train] = shuffleArrays(x_train, y_train);
    for (let i = 0; i < x_train.length; i++) {
      const x = Matrix.fromArray([new_x_train[i]]);
      const y = Matrix.fromArray([new_y_train[i]]);

      let y_pred = x;
      for (const layer of network) {
        y_pred = layer.forward(y_pred);
      }
      let gradient = y_pred.sub(y);
      epochLoss += gradient.pow(2).div(2).data[0][0];
      for (const layer of network.reverse()) {
        gradient = layer.backward(gradient, learning_rate);
      }
      network.reverse();
      // const testPredictions = test_dataset(network, x_test, y_test);
      // setypredvalues(testPredictions);
      // await sleep(DELAY_MS);
    }
    epochLoss = epochLoss / x_train.length;
    if (isNaN(epochLoss)) {
      alert("Loss reached infinity!");
      return;
    }
    console.log(`Epoch : ${e}/${epochs} | Loss : ${epochLoss}`);
    // const testPredictions = test_dataset(network, x_test, y_test);
    // setypredvalues(testPredictions);
    // await sleep(DELAY_MS);
  }
  alert("Finished training!");
  const testPredictions = test_dataset(network, x_test, y_test);
  setypredvalues(testPredictions);
}

function App() {
  // // Example usage:

  const xtrainValues: number[][] = [];
  const ytrainValues: number[][] = [];
  const xtestValues: number[][] = [];
  const ytestValues: number[][] = [];

  function toPredict(x: number) {
    return Math.sin(x);
  }
  for (let i = -10; i < 10; i = i + 0.1) {
    xtrainValues.push([i]);
    ytrainValues.push([toPredict(i)]);
  }

  for (let i = -20; i < 20; i = i + 0.01) {
    xtestValues.push([i]);
    ytestValues.push([toPredict(i)]);
  }

  const [normalizedXTrainValues, normalizedXTestValues] = standardScaler(
    xtrainValues,
    xtestValues
  );

  const network = [new Dense(1, 64), new ReLU(), new Dense(64, 1)];
  const [ypredictionValues, setypredvalues] = useState(
    test_dataset(network, normalizedXTestValues, ytestValues)
  );
  return (
    <>
      <div>2-D function approximmator!</div>
      <div>
        Enter any 2-D function, i.e one input and one output and train the
        neural network to fit the output!
      </div>
      <div>
        Let's keep the scaling of the function to be centered around 0 just for
        visualization.
      </div>
      <div>500x500 pixels</div>
      <button
        onClick={() => {
          train(
            network,
            normalizedXTrainValues,
            ytrainValues,
            1000,
            1e-3,
            setypredvalues,
            normalizedXTestValues,
            ytestValues
          );
        }}
      >
        Start training!
      </button>
      <GraphPlotter
        props={{
          xtrainValues,
          ytrainValues,
          xtestValues,
          ytestValues,
          ypredictionValues,
        }}
      />
    </>
  );
}
const GraphPlotter = (props: any) => {
  const canvasRef = useRef(null);
  const {
    xtrainValues,
    ytrainValues,
    xtestValues,
    ytestValues,
    ypredictionValues,
  } = props.props;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    function plotFunction(
      xValues: number[][],
      yValues: number[][],
      color: string
    ) {
      // Generate x values from 0 to 2π
      const xMatrix = Matrix.fromArray(xValues);

      // Calculate y values (sin(x))
      const yMatrix = Matrix.fromArray(yValues);

      // Scale the values to fit the canvas
      const scaledX = xMatrix.mult(100); // Scale x values
      const scaledY = yMatrix.mult(100).map((value) => -value); // Scale y values and invert (since canvas y-axis is flipped)

      // Translate coordinates to center the graph
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.fillStyle = color;
      for (let i = 0; i < scaledX.rows; i++) {
        const x = scaledX.data[i][0] + centerX;
        const y = scaledY.data[i][0] + centerY;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Call the plotFunction to plot the graph
    plotFunction(xtestValues, ytestValues, "blue");
    plotFunction(xtrainValues, ytrainValues, "red");
    plotFunction(xtestValues, ypredictionValues, "green");
  }, [ypredictionValues]);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default App;
