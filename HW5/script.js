function generateColor() {
  const hexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += hexArray[Math.floor(Math.random() * 16)];
  }
  return `#${code + "bb"}`;
}

function getAvgDev(dataSamples, n) {
  let mean = 0,
    dev = 0;
  for (let j = 0; j < dataSamples.length; j++) {
    let xn = dataSamples[j][n];
    let delta = xn - mean;
    mean += delta / (j + 1);
    dev += delta * (xn - mean);
  }

  return [mean, dev / (dataSamples[0].length - 1)];
}

function drawHisto(histoMap, ystep, histoStep, canvas, ystart, xstart = 0) {
  const ctx = canvas.getContext("2d");
  if (xstart == 0) ctx.clearRect(0, 0, canvas.width, canvas.height);
  const xstep =
    xstart == 0
      ? (canvas.width - 100) / Math.max(...histoMap.values())
      : 200 / Math.max(...histoMap.values());
  xcoord = xstart == 0 ? 25 : xstart;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  //vertical grid line
  ctx.moveTo(xcoord, canvas.height);
  ctx.lineTo(xcoord, 0);
  ctx.stroke();

  ctx.font = `${histoStep / 2}px serif`;
  histoMap.forEach((value, key, map) => {
    let ycoord = ystart - key * ystep;
    //numbers only for final distribution
    if (xstart == 0) {
      ctx.fillStyle = "black";
    } else {
      ctx.fillStyle = "rgba(0,250,127,0.7)";
    }
    ctx.fillRect(xcoord, ycoord - histoStep / 2, value * xstep, histoStep);
  });
}

function drawGrid(ctx, width, height, n, time) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(50, height);
  ctx.moveTo(50, height / 2);
  ctx.lineTo(width - 30, height / 2);
  ctx.stroke();
  ctx.fillStyle = "black";
  ctx.font = `20px serif`;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    let x = i / 4,
      textPosition = (width - 100) * x;
    ctx.fillText(
      `${(x * time).toFixed(2)}`,
      35 + textPosition,
      height / 2 + 20
    );
    ctx.moveTo(50 + textPosition, height / 2 - 5);
    ctx.lineTo(50 + textPosition, height / 2 + 5);
    ctx.stroke();
  }
}

function drawPath(path, ctx, width, ystep, n, stepLineBox, yorig) {
  let xstep = (width - 100) / n;
  let currentValue = 0;
  ctx.strokeStyle = generateColor();
  ctx.beginPath();
  ctx.moveTo(50, yorig);
  for (let i = 1; i <= n; i++) {
    if (stepLineBox) ctx.lineTo(i * xstep + 50, yorig - currentValue * ystep);
    currentValue = path[i];
    ctx.lineTo(i * xstep + 50, yorig - currentValue * ystep);
  }
  ctx.lineTo(width - 50, yorig - currentValue * ystep);
  ctx.stroke();
}

function drawGraph(paths, n, time, finalDistr, intDistr, jump, intStep) {
  let canvas = document.getElementById("canvas"),
    width = canvas.width,
    height = canvas.height,
    ctx = canvas.getContext("2d");

  //scaliamo il salto verticale in base al valore massimo per leggibilita'

  let maxValue = Math.max(...paths.flat().map(Math.abs));
  let ystep = maxValue > 5 ? height / (maxValue * 2.2) : height / 10;
  maxValue = Math.max(Math.max(...paths.flat()));

  let stepLineBox = document.getElementById("step_line_checkmark").checked;

  drawGrid(ctx, width, height, n, time);

  paths.forEach((element) => {
    drawPath(element, ctx, width, ystep, n, stepLineBox, height / 2);
  });
  let histoStep = ystep * jump;
  let barCanvas = document.getElementById("histo_canvas");
  if (document.getElementById("final_histo").checked)
    drawHisto(finalDistr, ystep, histoStep, barCanvas, height / 2);

  if (intStep !== -1)
    drawHisto(
      intDistr,
      ystep,
      histoStep,
      canvas,
      height / 2,
      50 + ((width - 100) * intStep) / n
    );

  let offset = maxValue * ystep;

  ctx.beginPath();
  ctx.strokeStyle = "rgb(200,200,200)";
  ctx.fillStyle = "black";
  ctx.font = `20px serif`;
  ctx.moveTo(50, height / 2 - offset);
  ctx.lineTo(width, height / 2 - offset);
  ctx.fillText(`${maxValue.toFixed(2)}`, 0, height / 2 - offset);
  let minValue = Math.min(...paths.flat());
  offset = minValue * ystep;
  ctx.moveTo(50, height / 2 - offset);
  ctx.lineTo(width, height / 2 - offset);
  ctx.fillText(`${minValue.toFixed(2)}`, 0, height / 2 - offset);
  ctx.stroke();
}

function runSimulation(n, prob, pathNum, time, intStep = -1) {
  //the program implements a walk where at every new step we have a probability
  // of p of having a positive jump in height (of sqrt(dt))
  //the user decides all of the variables
  switch (parseInt(document.getElementById("succ_jump").value)) {
    case 1:
      plusJump = 1;
      break;
    case 2:
      plusJump = 0;
      break;
    case 3:
      plusJump = Math.sqrt(time / n);
      break;
  }

  switch (parseInt(document.getElementById("fail_jump").value)) {
    case 1:
      failJump = 1;
      break;
    case 2:
      failJump = 0;
      break;
    case 3:
      failJump = Math.sqrt(time / n);
      break;
  }
  let paths = [],
    intDistr = new Map(),
    finalDistr = new Map(),
    score = 0;
  (mean = 0), (variance = 0);
  for (let i = 0; i < pathNum; i++) {
    let localPath = [0];
    let value = 0;
    //n intervals => n+1 points on the path, so we use an array of length n+1
    //to store every point in the trajectory
    for (let j = 1; j <= n; j++) {
      if (Math.random() < prob) {
        value += plusJump;
        score++;
      } else {
        value -= failJump;
      }
      localPath.push(value);
      if (j == intStep) {
        intDistr.get(value) == null
          ? intDistr.set(value, 1)
          : intDistr.set(value, intDistr.get(value) + 1);
      }
    }
    paths.push(localPath);
    finalDistr.get(localPath[n]) == null
      ? finalDistr.set(localPath[n], 1)
      : finalDistr.set(localPath[n], finalDistr.get(localPath[n]) + 1);
  }
  [mean, variance] = getAvgDev(paths, n);
  drawGraph(
    paths,
    n,
    time,
    finalDistr,
    intDistr,
    Math.max(plusJump, Math.abs(failJump)),
    intStep
  );
  document.getElementById("avg_display").innerHTML = `<p>Mean: ${mean.toFixed(
    4
  )}</p>
  <p>Variance  = ${variance.toFixed(4)}</p>
  <p>Distance between total relative success frequency and probability: ${(
    score / (pathNum * n) -
    prob
  ).toFixed(4)}</p>`;
}

document.getElementById("my_btn").addEventListener("click", () => {
  const n = parseInt(document.getElementById("steps").value);
  const lambda = parseFloat(document.getElementById("prob").value);
  const pathNum = parseInt(document.getElementById("path_num").value);
  const time = parseInt(document.getElementById("time").value);
  const intStep = parseInt(document.getElementById("int_step").value);
  runSimulation(n, lambda, pathNum, time, intStep);
});
