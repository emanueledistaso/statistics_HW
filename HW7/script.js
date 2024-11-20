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

function getAvgDev(dataSamples) {
  let mean = 0,
    dev = 0,
    n = 0;
  for (let x of dataSamples) {
    n++;
    let delta = x - mean;
    mean += delta / n;
    dev += delta * (x - mean);
  }

  dev = n > 1 ? dev / (n - 1) : 0;
  return [mean, dev];
}

//we apply the welford recursion a little differently to fit the format of result array
function getAvgResults(dataSamples) {
  let mean = 0,
    total = 0;
  for (let j = 0; j < dataSamples.length; j++) {
    for (let i = 0; i < dataSamples[j]; i++) {
      let xn = j + 1;
      let delta = xn - mean;
      mean += delta / (total + 1);
      total++;
    }
  }

  return mean;
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

function printHisto(data) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const useHeight = canvas.height - 40;
  const canvasHeight = canvas.height;
  const width = canvas.width;
  //clear canvas
  ctx.clearRect(0, 0, width, canvasHeight);
  //count the occurrences of each mean (maxcount will define the scale)
  const count = {};
  let maxCount = 0;

  data.forEach((value) => {
    // Round the value to two decimal places
    const roundedValue = Math.round(value * 100) / 100;
    count[roundedValue] = (count[roundedValue] || 0) + 1;
    if (count[roundedValue] > maxCount) {
      maxCount = count[roundedValue];
    }
  });
  const ordMeans = Object.keys(count)
    .sort((a, b) => parseFloat(a) - parseFloat(b)) // Sort based on numerical value
    .reduce((obj, key) => {
      obj[key] = count[key];
      return obj;
    }, {});
  //despite countless tries integer values still come up first
  console.log(ordMeans);

  ctx.font = `15px serif`;
  ctx.strokeStyle = "black";
  ctx.moveTo(0, 0);
  ctx.lineTo(0, useHeight);
  ctx.lineTo(width, useHeight);
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  const ordMeansLength = Object.keys(ordMeans).length;
  const barWidth = Math.floor(
    (width - (ordMeansLength + 1) * 5) / ordMeansLength
  );
  const padding = 5; // Space between bars
  //draw bar graph
  let xstart = 5; // Start position on the x-axis with padding for the first bar
  Object.keys(ordMeans).forEach((value) => {
    const barHeight = (ordMeans[value] / maxCount) * (useHeight - 20); // Normalize the height
    const yPosition = useHeight - barHeight;

    ctx.fillStyle = "#1984c5";
    ctx.fillRect(xstart, yPosition, barWidth, barHeight);

    ctx.fillStyle = "black";
    ctx.fillText(value, xstart + barWidth / 2 - 8, useHeight + 20);

    xstart += barWidth + padding;
  });
}

function runMultipleSimulation(distr, sampleSize, samples) {
  let means = new Array();
  const [expVal, expVariance] = getExpVal(distr);
  for (let i = 0; i < samples; i++) {
    //compute empirical distribution and its mean and variance
    const results = runSimulation(distr, sampleSize);
    const intMean = getAvgResults(results);
    //we store the mean to its second significant digit otherwise it becomes too cluttered and less interesting for us
    means.push(parseFloat(intMean.toFixed(2)));
  }
  //now I can compute the mean and variance of the means using welford recursion
  const [mean, variance] = getAvgDev(means);
  //now print the means histogram
  const avgDisp = document.getElementById("avg_disp");
  document.getElementById("canvas_div").classList.remove("hidden");
  avgDisp.classList.remove("hidden");
  printHisto(means);
  //print means and variance
  avgDisp.innerHTML = `<p>Total Mean = ${mean.toFixed(
    2
  )}</p> <p>Expected Value = ${expVal.toFixed(
    2
  )}</p> <p>Variance of means = ${variance.toFixed(2)}`;
}

document.getElementById("sim_btn").addEventListener("click", () => {
  const distr = probGenerator(
    parseInt(document.getElementById("image_n").value)
  );
  const sampleSize = parseInt(document.getElementById("sample_size").value);
  const samples = parseInt(document.getElementById("samples").value);
  runMultipleSimulation(distr, sampleSize, samples);
});
