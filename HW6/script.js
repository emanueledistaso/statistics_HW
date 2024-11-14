function probGenerator(n) {
  let pArr = new Array();
  let range = 1;
  for (let i = 0; i < n - 1; i++) {
    //generate random number in [0,1]
    let p = Math.random() * range;
    pArr.push(p);
    //decrease the range to ensure total sum equals to 1
    range -= p;
  }
  pArr.push(range);
  return pArr;
}

function printEntries(array, parentDiv) {
  //clean up the content of the div
  parentDiv.innerHTML = ``;

  //now we enter a for loop where we append the input fields
  for (let i = 0; i < array.length; i++) {
    //generate labels
    const div = document.createElement("div");
    div.classList.add("input-box", "flex", "hor");
    const label = document.createElement("label");
    label.setAttribute("for", `p${i}`);
    label.innerText = `P[X=${i + 1}]`;
    label.classList.add("label");

    //generate input fields
    const input = document.createElement("input");
    input.setAttribute("id", `p${i}`);
    input.setAttribute("name", `p${i}`);
    input.type = "number";
    input.classList.add("input-field", "probability-input");
    //For formatting we limit number of digits to 2
    input.value = array[i].toFixed(2);

    //append to parent
    parentDiv.appendChild(div);
    div.appendChild(label);
    div.appendChild(input);
  }
}

function getDistribution(n) {
  let distr = new Array();
  for (let i = 0; i < n; i++) {
    distr.push(parseFloat(document.getElementById(`p${i}`).value));
  }
  return distr;
}

function runSimulation(distr, tosses) {
  let index = distr.length;
  //we make shallow copy of distribution as to not modify original array
  let usedDistr = [...distr];
  //now we modify the distribution array to make it usable
  for (let i = 1; i < index; i++) {
    usedDistr[i] += usedDistr[i - 1];
  }

  //initialize empty array
  let results = new Array(index);
  results.fill(0);
  //now run the "coin tosses"
  for (let i = 0; i < tosses; i++) {
    let toss = Math.random();
    for (let j = 0; j < index; j++) {
      if (toss <= usedDistr[j]) {
        results[j]++;
        break;
      }
    }
  }
  return results;
}

//we apply the welford recursion a little differently to fit the format of result array
function getAvgDev(dataSamples) {
  let mean = 0,
    dev = 0,
    total = 0;
  for (let j = 0; j < dataSamples.length; j++) {
    for (let i = 0; i < dataSamples[j]; i++) {
      let xn = j + 1;
      let delta = xn - mean;
      mean += delta / (total + 1);
      dev += delta * (xn - mean);
      total++;
    }
  }

  return [mean, dev / total];
}

function getExpVal(distribution) {
  //expected value
  let expVal = 0;
  let variance = 0;
  for (let i = 0; i < distribution.length; i++) {
    expVal += (i + 1) * distribution[i];
    variance += (i + 1) ** 2 * distribution[i];
  }
  variance -= expVal ** 2;
  return [expVal, variance];
}

function printLegend(canvas) {
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1984c5";
  ctx.fillRect(300, 10, 50, 30);
  ctx.fillStyle = "#e14b31";
  ctx.fillRect(600, 10, 50, 30);
  ctx.fillStyle = "black";
  ctx.font = `15px serif`;
  ctx.fillText(" = Empirical Distribution", 375, 30);
  ctx.fillText(" = Theoretical Distribution", 675, 30);
}

function printHisto(real, theoretical, total) {
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");
  let width = canvas.width,
    height = canvas.height - 50;
  let legend = document.getElementById("legend");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let rectWidth = width / (real.length * 2);
  //convert real to frequency distribution
  const freq = real.map((element) => element / total);
  //print legend
  printLegend(legend);
  ctx.font = `15px serif`;
  ctx.strokeStyle = "black";
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();
  //print the bars for empirical frequency
  for (let i = 0; i < real.length; i++) {
    ctx.fillStyle = "#1984c5";
    ctx.fillRect(i * 2 * rectWidth, height, rectWidth, -freq[i] * height);
    ctx.fillStyle = "black";
    ctx.fillText(`${i + 1}`, (2 * i + 1) * rectWidth, canvas.height - 10);
  }
  //print theoretical distribution
  ctx.fillStyle = "#e14b31";

  for (let i = 0; i < theoretical.length; i++) {
    ctx.fillRect(
      (i * 2 + 1) * rectWidth,
      height,
      rectWidth,
      -theoretical[i] * height
    );
  }
}

document.getElementById("prob_btn").addEventListener("click", () => {
  const rand = probGenerator(document.getElementById("image_n").value);
  printEntries(rand, document.getElementById("probability_box"));
  document.getElementById("sim_btn").classList.remove("hidden");
});

document.getElementById("sim_btn").addEventListener("click", () => {
  const distr = getDistribution(
    parseInt(document.getElementById("image_n").value)
  );
  const totalSims = parseInt(document.getElementById("total_n").value);
  const result = runSimulation(distr, totalSims);
  const [realMean, realVar] = getAvgDev(result);
  const [expVal, expVar] = getExpVal(distr);
  const avgDisp = document.getElementById("avg_disp");
  document.getElementById("canvas_div").classList.remove("hidden");
  avgDisp.classList.remove("hidden");
  printHisto(result, distr, totalSims);
  avgDisp.innerHTML = `<p>Empirical Mean = ${realMean.toFixed(
    2
  )}</p> <p>Expected Value = ${expVal.toFixed(
    2
  )}</p> <p>Empirical Variance = ${realVar.toFixed(
    2
  )}</p><p>Expected Variance = ${expVar.toFixed(2)}</p>`;
});
