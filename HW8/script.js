//we save the letters in order of frequency in two strings for a "tryagain function".

const engFrequency = "etaoinshrdlcumwfypbvkjxqz";
const itFrequency = "eaiotnrsludcmphbfxjkqzw";
let tryIndex = 0;

function caesarEncrypt(text, key) {
  let result = "";
  for (let ch of text) {
    if (ch.match(/^[a-z0-9]+$/i)) {
      let offset, shiftedChar;
      if (ch >= "A" && ch <= "Z") {
        // Handle uppercase letters
        offset = "A".charCodeAt(0);
        shiftedChar = String.fromCharCode(
          ((ch.charCodeAt(0) - offset + key) % 26) + offset
        );
      } else if (ch >= "a" && ch <= "z") {
        // Handle lowercase letters
        offset = "a".charCodeAt(0);
        shiftedChar = String.fromCharCode(
          ((ch.charCodeAt(0) - offset + key) % 26) + offset
        );
      } else if (ch >= "0" && ch <= "9") {
        // Handle digits (0-9)
        offset = "0".charCodeAt(0);
        shiftedChar = String.fromCharCode(
          ((ch.charCodeAt(0) - offset + key) % 10) + offset
        );
      }
      result += shiftedChar;
    } else {
      // Non-letter characters are not shifted
      result += ch;
    }
  }
  return result;
}

function mapCharFrequency(text) {
  let frequencyMap = {};
  for (let ch of text) {
    if (ch.match(/^[a-z0-9]+$/i)) {
      frequencyMap[ch.toLowerCase()] =
        (frequencyMap[ch.toLowerCase()] || 0) + 1;
    }
  }
  return frequencyMap;
}

function findMostCommon(textMap) {
  let mostFreqCh = "";
  let maxCount = 0;
  for (let [ch, count] of Object.entries(textMap)) {
    if (count > maxCount) {
      mostFreqCh = ch;
      maxCount = count;
    }
  }
  return [mostFreqCh, maxCount];
}

function caesarDecrypt(text, mostFrequentChar, tryIndex) {
  let shift =
    (mostFrequentChar.charCodeAt(0) -
      engFrequency.toUpperCase().charCodeAt(tryIndex) +
      26) %
    26;

  //simply shift in reverse to decrypt
  return caesarEncrypt(text, 26 - shift);
}

function printHisto(data, maxCount) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const useHeight = canvas.height - 40;
  const canvasHeight = canvas.height;
  const width = canvas.width;
  //clear canvas
  ctx.clearRect(0, 0, width, canvasHeight);
  //count the occurrences of each mean (maxcount will define the scale)

  ctx.font = `15px serif`;
  ctx.strokeStyle = "black";
  ctx.moveTo(0, 0);
  ctx.lineTo(0, useHeight);
  ctx.lineTo(width, useHeight);
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  const objLength = Object.keys(data).length;
  const barWidth = Math.floor((width - (objLength + 1) * 5) / objLength);
  const padding = 5; // Space between bars
  //draw bar graph
  let xstart = 5; // Start position on the x-axis with padding for the first bar
  //we print the histogram with the letters sorted alphabetically
  Object.keys(data)
    .sort()
    .forEach((value) => {
      const barHeight = (data[value] / maxCount) * (useHeight - 20); // Normalize the height
      const yPosition = useHeight - barHeight;

      ctx.fillStyle = "#1984c5";
      ctx.fillRect(xstart, yPosition, barWidth, barHeight);

      ctx.fillStyle = "black";
      ctx.fillText(value, xstart + barWidth / 2 - 8, useHeight + 20);

      xstart += barWidth + padding;
    });
}

document.getElementById("encrypt-btn").addEventListener("click", () => {
  tryIndex = 0;
  const plaintext = document.getElementById("input-text").value;
  const key = Math.floor(Math.random() * 25) + 1;
  const encryptedText = caesarEncrypt(plaintext, key);
  document.getElementById(
    "encrypted-title"
  ).innerHTML = `Encrypted Text (Key = ${key})`;
  document.getElementById(
    "encrypted-text"
  ).innerHTML = `<p>${encryptedText}</p>`;
  document.getElementById("decrypt-btn").disabled = false;
});

document.getElementById("decrypt-btn").addEventListener("click", () => {
  const encryptedText = document.getElementById("encrypted-text").innerText;
  if (encryptedText) {
    const frequencyMap = mapCharFrequency(encryptedText);
    const [mostFrequentChar, maxCount] = findMostCommon(frequencyMap);
    if (tryIndex == 0) {
      document.getElementById("canvas-div").classList.remove("hidden");
      printHisto(frequencyMap, maxCount);
    }
    const decryptedText = caesarDecrypt(
      encryptedText,
      mostFrequentChar,
      tryIndex
    );
    document.getElementById(
      "decrypted-text"
    ).innerHTML = `<p>${decryptedText}</p>`;
  }
  tryIndex++;
});

//if input text changes treat it as wholly new and reset the index of retries
document.getElementById("input-text").addEventListener("change", () => {
  tryIndex = 0;
});
