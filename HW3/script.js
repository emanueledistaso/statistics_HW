function generateColor() {
  const hexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += hexArray[Math.floor(Math.random() * 16)];
  }
  return `#${code}`;
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

function drawGrid(ctx, width, height, n) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(50, height);
  ctx.moveTo(0, height - 50);
  ctx.lineTo(width - 30, height - 50);
  ctx.stroke();
  ctx.fillStyle = "black";
  ctx.font = `20px serif`;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    let x = i / 4,
      textPosition = (width - 100) * x;
    ctx.fillText(`${n * x}`, 35 + textPosition, height - 20);
    ctx.moveTo(50 + textPosition, height - 50);
    ctx.lineTo(50 + textPosition, height - 60);
    ctx.stroke();
  }
}

function drawPath(path, ctx, width, height, ystep, n, stepLineBox) {
  let xstep = (width - 100) / n;
  let currentValue = 0;
  ctx.strokeStyle = generateColor();
  ctx.beginPath();
  ctx.moveTo(50, height - 50);
  for (let i = 1; i <= n; i++) {
    if (path[i] > currentValue) {
      if (stepLineBox)
        ctx.lineTo(i * xstep + 50, height - (currentValue * ystep + 50));
      currentValue = path[i];
      ctx.lineTo(i * xstep + 50, height - (currentValue * ystep + 50));
    }
  }
  ctx.lineTo(width - 50, height - (currentValue * ystep + 50));
  ctx.stroke();
}

function drawGraph(paths, n, mean) {
  let canvas = document.getElementById("canvas"),
    width = canvas.width,
    height = canvas.height,
    ctx = canvas.getContext("2d");

  //scaliamo il salto verticale in base al valore massimo per leggibilita'
  let maxValue = Math.max(...paths.flat());
  let ystep =
    maxValue > 100 ? (height - 100) / (maxValue * 1.5) : (height - 100) / 100;

  let stepLineBox = document.getElementById("step_line_checkmark").checked;
  drawGrid(ctx, width, height, n);
  paths.forEach((element) => {
    drawPath(element, ctx, width, height, ystep, n, stepLineBox);
  });
  //ora mettiamo una linea al valore massimo e della media
  let maxHeight = height - (maxValue * ystep + 50),
    meanHeight = height - (mean * ystep + 50);
  ctx.strokeStyle = "rgb(200,200,200)";
  ctx.beginPath();
  ctx.moveTo(50, maxHeight);
  ctx.lineTo(width - 50, maxHeight);
  ctx.moveTo(50, meanHeight);
  ctx.lineTo(width - 50, meanHeight);
  ctx.stroke();

  ctx.font = "20px serif";
  ctx.fillStyle = "black";
  ctx.fillText(`${maxValue}`, 25, maxHeight);
  ctx.fillText(`${mean.toFixed(2)}`, 0, meanHeight);
}

// n is the number of intervals, lambda is the probability
//modifier, pathNum is the number of paths
function runSimulation(n, lambda, pathNum) {
  //the program implements a walk where at every new step we have a probability
  // of lambda/n of having a positive jump in height (of +1)
  //the user decides all of the variables
  let paths = [],
    finalDistr = new Map(),
    score = 0;
  (mean = 0), (variance = 0), (p = lambda / n);
  for (let i = 0; i < pathNum; i++) {
    let localPath = [0];
    //n intervals => n+1 points on the path, so we use an array of length n+1
    //to store every point in the trajectory
    for (let j = 1; j <= n; j++) {
      Math.random() < p
        ? localPath.push(localPath[j - 1] + 1)
        : localPath.push(localPath[j - 1]);
    }
    paths.push(localPath);
    finalDistr.get(localPath[n]) == null
      ? finalDistr.set(localPath[n], 1)
      : finalDistr.set(localPath[n], finalDistr.get(localPath[n]) + 1);
    score += localPath[n];
  }
  //while not required I'll also compute the mean and variance to see how close
  //they are to the theoretical \mu \sigma**2 of the poisson distribution
  //let us also draw a line where the mean is to visualize on the graph (may be useful for high number of paths)
  [mean, variance] = getAvgDev(paths, n);
  drawGraph(paths, n, mean);
  document.getElementById(
    "avg_display"
  ).innerHTML = `<p>Distance between true mean and expected value: ${Math.abs(
    mean - lambda
  ).toFixed(4)}</p>
  <p>Distance between true variance and theoretical variance = ${variance.toFixed(
    4
  )}</p>
  <p>Distance between total relative success frequency and probability: ${(
    score / (pathNum * n) -
    lambda / n
  ).toFixed(4)}</p>`;
}

document.getElementById("my_btn").addEventListener("click", () => {
  const n = parseInt(document.getElementById("steps").value);
  const lambda = parseFloat(document.getElementById("lambda").value);
  const pathNum = parseInt(document.getElementById("path_num").value);
  runSimulation(n, lambda, pathNum);
});
