import React from "react";
import { Matrix } from "../../ml-library/matrix";
import { Dense, ReLU } from "../../ml-library/dense";
import { EpochData, Network } from "../../ml-library/network";
import { standardScaler } from "../../ml-library/utils";
import { useRef, useEffect, useState } from "react";

export default function Regression() {
  const xtrainValues: number[][] = [];
  const ytrainValues: number[][] = [];
  const xtestValues: number[][] = [];
  const ytestValues: number[][] = [];

  function toPredict(x: number) {
    return Math.sin(x) * 0.5;
  }
  for (let i = -10; i < 10; i = i + 0.01) {
    xtrainValues.push([i]);
    ytrainValues.push([toPredict(i)]);
  }

  for (let i = -20; i < 20; i = i + 0.1) {
    xtestValues.push([i]);
    ytestValues.push([toPredict(i)]);
  }

  const [normalizedXTrainValues, normalizedXTestValues] = standardScaler(
    xtrainValues,
    xtestValues
  );

  const [learningRate, setlearningrate] = useState(0);
  const [numEpochs, setnumEpochs] = useState(1);
  const [showTraining, setshowTraining] = useState(false);
  const [ypredictionValues, setypredictionValues] = useState<number[][]>();
  const [network, setnetwork] = useState<Network>();
  const [trainLoss, setrainLossData] = useState<number[][]>([]);
  const [testLoss, setestLossData] = useState<number[][]>([]);

  useEffect(() => {
    const newNetwork = new Network();
    newNetwork.network = [new Dense(1, 32), new ReLU(), new Dense(32, 1)];
    newNetwork.test_dataset(normalizedXTestValues, ytestValues).then((data) => {
      setypredictionValues(data[0]);
    });
    setnetwork(newNetwork);
  }, []);

  function epochCallback(epochData: EpochData) {
    const { epoch, totalEpochs, epochLoss, test } = epochData;
    console.log(
      `Epoch : ${epoch}/${totalEpochs} | Loss : ${epochLoss} || TestLoss : ${test.loss}`
    );
    setrainLossData((prev) => [...prev, [epochLoss]]);
    setestLossData((prev) => [...prev, [test.loss]]);
    setypredictionValues(test.predictions);
  }
  function finishedCallback() {}
  async function startTraining() {
    network?.trainBatch(
      normalizedXTrainValues,
      ytrainValues,
      normalizedXTestValues,
      ytestValues,
      numEpochs,
      10 ** -learningRate,
      epochCallback,
      finishedCallback
    );
  }
  if (!ypredictionValues) return;
  return (
    <>
      <div>2-D function approximmator!</div>
      <div>
        Enter any 2-D function, i.e one input and one output and train the
        neural network to fit the output!
      </div>
      <input
        type="range"
        name="learning-rate"
        id=""
        value={learningRate}
        min={0}
        step={1}
        max={5}
        onChange={(e) => {
          setlearningrate(parseInt(e.target.value));
        }}
      />
      <p>Learning Rate : {10 ** -learningRate}</p>
      <input
        type="range"
        name="epochs"
        id=""
        value={numEpochs}
        min={0}
        step={10}
        max={1000}
        onChange={(e) => {
          setnumEpochs(parseInt(e.target.value));
        }}
      />
      <p>Number of Epochs : {numEpochs}</p>
      <button
        className="show-training"
        onClick={() => {
          setshowTraining((prev) => !prev);
        }}
      >
        {showTraining ? "Showing training" : "Show training..."}
      </button>
      <button onClick={startTraining}>Start training!</button>
      <div>
        <GraphPlotter
          props={{
            xtrainValues,
            ytrainValues,
            xtestValues,
            ytestValues,
            ypredictionValues,
          }}
        />
        <LossPlot lossData={trainLoss} />
        <LossPlot lossData={testLoss} />
      </div>
    </>
  );
}

const GraphPlotter = (props) => {
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
    plotFunction(xtrainValues, ytrainValues, "blue");
    plotFunction(xtestValues, ytestValues, "red");
    plotFunction(xtestValues, ypredictionValues, "green");
  }, [ypredictionValues]);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

const LossPlot = ({ lossData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Plot loss data
    const plotWidth = canvas.width - 60;
    const plotHeight = canvas.height - 60;

    // Find min and max loss values
    const minLoss = Math.min(...lossData);
    const maxLoss = Math.max(...lossData);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, plotHeight + 20);
    ctx.lineTo(plotWidth + 40, plotHeight + 20);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Plot loss data points
    ctx.beginPath();
    ctx.moveTo(
      40,
      plotHeight -
        ((lossData[0] - minLoss) / (maxLoss - minLoss)) * plotHeight +
        20
    );
    for (let i = 1; i < lossData.length; i++) {
      const x = (plotWidth / (lossData.length - 1)) * i + 40;
      const y =
        plotHeight -
        ((lossData[i] - minLoss) / (maxLoss - minLoss)) * plotHeight +
        20;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#f00";
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = "#000";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const numLabels = 5;
    for (let i = 0; i <= numLabels; i++) {
      const value = minLoss + (maxLoss - minLoss) * (i / numLabels);
      const y = plotHeight * (1 - (value - minLoss) / (maxLoss - minLoss)) + 20;
      ctx.fillText(value.toFixed(2), 35, y);
    }

    // Draw x-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const stepSize = Math.ceil(lossData.length / 10);
    for (let i = 0; i < lossData.length; i += stepSize) {
      const x = (plotWidth / (lossData.length - 1)) * i + 40;
      ctx.fillText(i.toString(), x, plotHeight + 25);
    }
  }, [lossData]);

  return <canvas ref={canvasRef} width={1000} height={500} />;
};
