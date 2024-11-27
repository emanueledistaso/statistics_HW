function drawHisto(distribution) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const useHeight = canvas.height - 40;
  const canvasHeight = canvas.height;
  const width = canvas.width;
  //clear canvas
  ctx.clearRect(0, 0, width, canvasHeight);
  //count the occurrences of each mean (maxcount will define the scale)
  const maxfreq = Math.max(...distribution);
  ctx.font = `15px serif`;
  ctx.strokeStyle = "black";
  ctx.moveTo(0, 0);
  ctx.lineTo(0, useHeight);
  ctx.lineTo(width, useHeight);
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  const barWidth = Math.floor(
    (width - (distribution.length + 1) * 5) / distribution.length
  );
  const padding = 5; // Space between bars
  //draw bar graph
  let xstart = 5; // Start position on the x-axis with padding for the first bar
  for (iterator in distribution) {
    const barHeight = (distribution[iterator] / maxfreq) * (useHeight - 20); // Normalize the height
    const yPosition = useHeight - barHeight;

    ctx.fillStyle = "#1984c5";
    ctx.fillRect(xstart, yPosition, barWidth, barHeight);

    ctx.fillStyle = "black";
    ctx.fillText(iterator, xstart + barWidth / 2 - 8, useHeight + 20);

    xstart += barWidth + padding;
  }
}

//generates Y = g^U mod n distribution
function generateDistribution(gen, maxU, modulo) {
  //we'll run 1000 experiments
  let distribution = new Array(modulo).fill(0);
  for (let i = 0; i < 3000; i++) {
    const rand = Math.floor(Math.random() * maxU) + 1;
    const result = gen ** rand % modulo;
    distribution[result]++;
  }
  return distribution;
}

function computeEntropy(frequencies) {
  const totalfrequency = frequencies.reduce((sum, freq) => sum + freq, 0);
  //now compute entropy;
  let entropy = 0;
  frequencies.forEach((frequency) => {
    if (frequency > 0) {
      const prob = frequency / totalfrequency;
      entropy -= prob * Math.log2(prob);
    }
  });
  return entropy;
}
function computeSimpson(frequencies) {
  let index = 0;
  const totalfrequency = frequencies.reduce((sum, freq) => sum + freq, 0);
  frequencies
    .filter((a) => a > 0)
    .forEach((value) => (index += value * (value - 1)));
  return 1 - index / (totalfrequency * (totalfrequency - 1));
}
document.getElementById("sim_btn").addEventListener("click", () => {
  const gen = parseInt(document.getElementById("generator").value);
  const maxU = parseInt(document.getElementById("max_U").value);
  const modulo = parseInt(document.getElementById("modulo").value);
  const distr = generateDistribution(gen, maxU, modulo);
  const avgDisp = document.getElementById("avg_disp");
  document.getElementById("canvas_div").classList.remove("hidden");
  avgDisp.classList.remove("hidden");
  const entropy = computeEntropy(distr);
  const simpsonIndex = computeSimpson(distr);
  avgDisp.innerHTML = `<p>Entropy = ${entropy.toFixed(
    2
  )}</p> <p>Simpson Index = ${simpsonIndex.toFixed(2)}`;
  drawHisto(distr);
});
