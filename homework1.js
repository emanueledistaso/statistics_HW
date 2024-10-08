//simply generates a random Hex
function generateColor() {
  const hexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += hexArray[Math.floor(Math.random() * 16)];
  }
  return `#${code}`;
}

//DrawOne, as the name implies, simply draws one of the
//stepline charts for a single attacker using a randomly generated hex colour
//the charts could have been made prettier by using Chart.js but I decided against using a library given last year's instructions
function drawSingleAttack(ctx, width, height, step, ystep, data) {
  ctx.strokeStyle = generateColor();
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let i = 1; i < data.length; i++) {
    //if there's a success at 'server' i we add a step
    //(Known Issue: doesn't seem to work properly for i=1)
    if (data[i] > data[i - 1])
      ctx.lineTo(i * step, height - data[i - 1] * ystep);
    ctx.lineTo(i * step, height - data[i] * ystep);
  }
  ctx.lineTo(width, height - data[data.length - 1] * ystep);
  ctx.stroke();
}

function drawHisto(histoMap, servers, attackers, ystep) {
  const canvas = document.getElementById("histoCanvas");
  const ctx = canvas.getContext("2d");
  canvas.height = ystep * servers;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const xstep = (canvas.width - 50) / Math.max(servers, attackers);
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(25, canvas.height);
  ctx.lineTo(25, 0);
  ctx.stroke();

  ctx.font = `${(ystep * 3) / 4}px serif`;
  histoMap.forEach((value, key, map) => {
    let ycoord = canvas.height - key * ystep;
    ctx.fillText(`${key}`, 0, ycoord - ystep / 4);
    ctx.strokeRect(25, ycoord - ystep, value * xstep, ystep);
    ctx.fillText(
      `${value}`,
      25 + value * xstep + xstep / 2,
      ycoord - ystep / 4
    );
  });
}

//I'll assume that the number of servers is less than 800
function drawChart([dataSamples, histoMap]) {
  const servers = dataSamples[0].length;
  const canvas = document.getElementById("canvas");
  const width = canvas.width;
  const ctx = canvas.getContext("2d");
  //clear canvas area
  ctx.clearRect(0, 0, width, width);
  const step = width / servers;
  const ystep = servers > 60 ? 30 : step;

  canvas.height = ystep * servers;
  const height = canvas.height;
  //we'll print a grid to fill the chart
  ctx.strokeStyle = "rgba(244, 244, 244, 0.05)";
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

  for (let i = 0; i < dataSamples.length; i++) {
    drawSingleAttack(ctx, width, height, step, ystep, dataSamples[i]);
  }
  //function that draws the graph counting how many attacckers achieved n successes
  drawHisto(histoMap, servers, dataSamples.length, ystep);
}

function getAverage(dataArray) {
  if (dataArray.length == 0) return [0, 0];
  let x = dataArray.pop();
  let [oldM, k] = getAverage(dataArray);
  return [oldM + (x - oldM) / ++k, k];
}
//simulate attacks, where n is the number of servers, m the number of hackers
// and p the probability of success for every single attack
function simulateAttacks(hackers, servers, p) {
  let outcomes = [];
  let finalResults = [];
  //in outcomes we store an array where every entry [i] is an array
  //storing the outcome at step [j]
  const histoMap = new Map();
  for (let i = 0; i < hackers; i++) {
    let successes = 0;
    let hackerresult = [0];
    for (let j = 1; j <= servers; j++) {
      if (Math.random() < p) {
        successes++;
      }
      hackerresult.push(successes);
    }
    outcomes.push(hackerresult);
    finalResults.push(successes);
    histoMap.get(successes) == null
      ? histoMap.set(successes, 1)
      : histoMap.set(successes, histoMap.get(successes) + 1);
  }
  const avgDisplay = document.getElementById("avgDisplay");
  avgDisplay.innerHTML = `Average Penetration Score=  ${getAverage(
    finalResults
  )[0].toFixed(2)}`;
  return [outcomes, histoMap];
}

document.getElementById("myBtn").addEventListener("click", () => {
  const n = parseInt(document.getElementById("servers").value);
  const m = parseInt(document.getElementById("hackers").value);
  const p = parseFloat(document.getElementById("prob").value);
  const canvasDiv = document.getElementById("canvas_div");
  canvasDiv.classList.remove("hor", "vert");
  document.getElementById("vertical").checked
    ? canvasDiv.classList.add("vert")
    : canvasDiv.classList.add("hor");

  drawChart(simulateAttacks(m, n, p));
});

