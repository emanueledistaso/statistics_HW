//add function to shuffle string (credits to Andy E on stackExchange)
//which implements Fisher-Yates shuffle
String.prototype.shuffle = function () {
  let string = this.split("");
  let n = string.length;

  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = string[i];
    string[i] = string[j];
    string[j] = tmp;
  }
  return string.join("");
};

function generateKey() {
  let alphabet = "abcdefghijklmnopqrstuvwxyz";
  let key = alphabet.shuffle();

  let cipherKey = {};
  for (let i = 0; i < 26; i++) {
    cipherKey[alphabet[i]] = key[i];
  }

  return cipherKey;
}

//store cipherKey in const generated on load, it is the same for every refresh
const cipherKey = generateKey();
const engFrequency = "etaoinshrdlcumwfypbvkjxqz";

function subEncrypt(text, keyObj) {
  const ptext = text.toLowerCase();
  let enctext = "";
  for (let ch of ptext) {
    code = ch.charCodeAt(0);
    if (
      //if alphanumeric apply substitution
      code > 96 &&
      code < 123
    )
      enctext += keyObj[ch];
    else {
      //otherwise keep as is
      enctext += ch;
    }
  }
  return enctext;
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

function freqKey(text) {
  //build frequency distribution
  let freqMap = mapCharFrequency(text);
  //sort it in order of frequency (higher frequency comes first)
  const ord = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

  const ordChars = Object.fromEntries(ord);

  //now build key using this ordered map
  let decKey = {};
  let curr = 0;
  const engfreq = engFrequency.split("");
  //most frequent letter -> most frequent english letter
  Object.keys(ordChars).forEach((key) => {
    decKey[key] = engfreq[curr];
    curr++;
  });

  return decKey;
}

function freqDecrypt(text) {
  //build decryption key based on frequency
  const decKey = freqKey(text);
  //now we decrypt
  let dectext = "";
  for (let ch of text) {
    code = ch.charCodeAt(0);
    if (
      //if alphanumeric apply substitution
      code > 96 &&
      code < 123
    )
      dectext += decKey[ch];
    else {
      //otherwise keep as is
      dectext += ch;
    }
  }
  return dectext;
}

function keyDecrypt(text, key) {
  let dectext = "";
  for (let ch of text) {
    code = ch.charCodeAt(0);
    if (
      //if alphanumeric apply substitution
      code > 96 &&
      code < 123
    )
      dectext += key[ch];
    else {
      //otherwise keep as is
      dectext += ch;
    }
  }
  return dectext;
}

document.getElementById("encrypt-btn").addEventListener("click", () => {
  let plaintext = document.getElementById("input-text").value;
  const key = cipherKey;
  const encryptedText = subEncrypt(plaintext, key);
  document.getElementById("encrypted-title").innerHTML = `Encrypted Text`;
  document.getElementById(
    "encrypted-text"
  ).innerHTML = `<p>${encryptedText}</p>`;
  document.getElementById("decrypt-btn").disabled = false;
  document.getElementById("permute-btn").disabled = false;
  document.getElementById("key-decrypt-btn").disabled = false;
});

document.getElementById("permute-btn").addEventListener("click", () => {
  let text = document.getElementById("encrypted-text").innerText;
  text = text.split("").reverse().join("");
  document.getElementById("encrypted-text").innerHTML = `<p>${text}</p>`;
});

document.getElementById("decrypt-btn").addEventListener("click", () => {
  const cipherText = document.getElementById("encrypted-text").innerText;
  const decryptedText = freqDecrypt(cipherText);
  document.getElementById(
    "decrypted-text"
  ).innerHTML = `<p>${decryptedText}</p>`;
});

document.getElementById("key-decrypt-btn").addEventListener("click", () => {
  const cipherText = document.getElementById("encrypted-text").innerText;
  const decKey = Object.fromEntries(
    Object.entries(cipherKey).map((a) => a.reverse())
  );
  const decryptedText = keyDecrypt(cipherText, decKey);
  document.getElementById(
    "decrypted-text"
  ).innerHTML = `<p>${decryptedText}</p>`;
});
