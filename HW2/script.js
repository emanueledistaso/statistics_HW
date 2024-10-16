function generateColor() {
  const hexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += hexArray[Math.floor(Math.random() * 16)];
  }
  return `#${code}`;
}

function drawPath(ctx, width, height, step, ystep, data, ystart) {
  ctx.strokeStyle = generateColor();
  ctx.beginPath();
  /* let ystart = height / 2; */
  ctx.moveTo(0, ystart);
  for (let i = 1; i < data.length; i++) {
    //(Known Issue: doesn't seem to work properly for i=1)
    ctx.lineTo(i * step, ystart - data[i - 1] * ystep);
    ctx.lineTo(i * step, ystart - data[i] * ystep);
  }
  ctx.lineTo(width, ystart - data[data.length - 1] * ystep);
  ctx.stroke();
}

function drawHisto(
  histoMap,
  servers,
  attackers,
  ystep,
  canvas,
  ystart,
  xstart = 0
) {
  const ctx = canvas.getContext("2d");
  if (xstart == 0) ctx.clearRect(0, 0, canvas.width, canvas.height);
  const xstep = (canvas.width - 50) / Math.max(servers, attackers);
  xcoord = xstart == 0 ? 25 : xstart;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  //vertical grid line
  ctx.moveTo(xcoord, canvas.height);
  ctx.lineTo(xcoord, 0);
  ctx.stroke();

  ctx.font = `${Math.min(ystep, xstep) / 2}px serif`;
  histoMap.forEach((value, key, map) => {
    let ycoord = ystart - key * ystep;
    //numbers only for final distribution
    if (xstart == 0) {
      ctx.fillStyle = "black";
      ctx.fillText(`${key}`, xstart, ycoord + ystep / 2);
      ctx.fillText(
        `${value}`,
        25 + value * xstep + xstep / 2,
        ycoord + ystep / 2
      );
    }
    ctx.fillStyle = "rgba(0,250,127,0.7)";
    ctx.fillRect(xcoord, ycoord - ystep / 2, value * xstep, ystep);
  });
}

function drawPenPath(canvas, path, n) {
  const len = path.length;
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  const step = width / len;
  let ystep = height / (path[len - 1] + 10);
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.lineTo(width, height);
  ctx.stroke();
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let i = 1; i <= len; i++) {
    ctx.lineTo(i * step, height - path[i] * ystep);
  }
  ctx.stroke();
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  ctx.moveTo(0, height);
  ystep = height / 1000;
  for (let i = 0; i < len; i++) {
    ctx.lineTo(
      i * step,
      height - ystep * Math.round((path[i] / (i * n)) * 1000)
    );
  }
  ctx.stroke();
}

function drawGrid(ctx, width, height, step, ystep, ystart) {
  ctx.strokeStyle = "rgba(250, 250, 250, 0.05)";
  ctx.beginPath();
  for (let i = 0; i <= width; i++) {
    //vertical lines
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, height);
    //horizontal lines
    ctx.moveTo(0, height - i * ystep);
    ctx.lineTo(width, height - i * ystep);
    ctx.stroke();
  }
  //now we print the axis
  ctx.beginPath();
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.moveTo(0, ystart);
  ctx.lineTo(width, ystart);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.stroke();
}

function drawChart([dataSamples, penPath, midResults, finalResults, midStep]) {
  const servers = dataSamples[0].length;
  const canvas = document.getElementById("canvas");
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  //clear canvas area
  ctx.clearRect(0, 0, width, width);
  const step = width / servers;
  const ystep =
    height /
    Math.abs(Math.max(...dataSamples.flat()) - Math.min(...dataSamples.flat()));
  const ystart = ystep * Math.max(...dataSamples.flat());
  //we'll print a grid to fill the chart
  drawGrid(ctx, width, height, step, ystep, ystart);
  for (let i = 0; i < dataSamples.length; i++) {
    drawPath(ctx, width, height, step, ystep, dataSamples[i], ystart);
  }
  //function that draws the histograms at step midstep and at the end (absolute number of penetrations)
  const penCanvas = document.getElementById("penPath");
  drawPenPath(penCanvas, penPath, servers);
  const finCanvas = document.getElementById("finHisto");
  drawHisto(
    midResults,
    servers,
    dataSamples.length,
    ystep,
    canvas,
    ystart,
    step * midStep
  );
  drawHisto(
    finalResults,
    servers,
    dataSamples.length,
    ystep,
    finCanvas,
    ystart
  );
}

function getAvgDev(dataSamples) {
  let mean = [];
  let variance = [];
  for (let i = 0; i < dataSamples[0].length; i++) {
    let delta = 0,
      runMean = 0,
      dev = 0;
    for (let j = 0; j < dataSamples.length; j++) {
      let xn = dataSamples[j][i];
      delta = xn - runMean;
      runMean += delta / (j + 1);
      dev += delta * (xn - runMean);
    }
    mean.push(runMean);
    variance.push(dev / (dataSamples[0].length - 1));
  }
  return [mean, variance];
}
//We keep this function from first homework that generates whole dataset with the random walks and the data for the histograms
function simulateAttacks(hackers, servers, p, midStep) {
  let scores = [];
  let penPath = [0];
  //in scores we store an array where every entry [i] is an array
  //storing the outcome at step [j]
  const midResults = new Map();
  const finalResults = new Map();
  totalPen = 0;
  for (let i = 0; i < hackers; i++) {
    let score = 0,
      penetrations = 0;
    rndWalkPath = [0];
    for (let j = 1; j <= servers; j++) {
      if (Math.random() < p) {
        score++;
        penetrations++;
      } else score--;
      if (j == midStep) {
        midResults.get(score) == null
          ? midResults.set(score, 1)
          : midResults.set(score, midResults.get(score) + 1);
      }
      rndWalkPath.push(score);
    }
    scores.push(rndWalkPath);
    finalResults.get(score) == null
      ? finalResults.set(score, 1)
      : finalResults.set(score, finalResults.get(score) + 1);
    totalPen += penetrations;
    penPath.push(totalPen);
  }
  let [mean, variance] = getAvgDev(scores);
  document.getElementById("avgDisplay").innerHTML = `<p>Mean = ${mean[
    servers
  ].toFixed(3)}</p><p> Variance = ${variance[servers].toFixed(
    3
  )}</p><p>Total Relative Penetrations = ${(
    totalPen /
    (servers * hackers)
  ).toFixed(5)}</p>`;
  return [scores, penPath, midResults, finalResults, midStep];
}

document.getElementById("myBtn").addEventListener("click", () => {
  const n = parseInt(document.getElementById("servers").value);
  const m = parseInt(document.getElementById("hackers").value);
  const p = parseFloat(document.getElementById("prob").value);
  const midStep = parseInt(document.getElementById("midStep").value);
  document.getElementById("canvas_div").classList.remove("hidden");
  drawChart(simulateAttacks(m, n, p, midStep));
});
