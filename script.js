const bareme = {
  TC: { individuelles: 6, collectives: 6 },
  "1BAC": { individuelles: 6, collectives: 7 },
  "2BAC": { individuelles: 7, collectives: 7 },
  "1AC": { individuelles: 6, collectives: 8 },
  "2AC": { individuelles: 6, collectives: 7 },
  "3AC": { individuelles: 6, collectives: 6 }
};

const niveau = document.getElementById("niveau");
const noteInd = document.getElementById("noteInd");
const noteCol = document.getElementById("noteCol");

function calculer() {
  const selected = niveau.value;

  if (!selected) {
    document.getElementById("maxInd").textContent = 0;
    document.getElementById("maxCol").textContent = 0;
    document.getElementById("total").textContent = 0;
    document.getElementById("maxTotal").textContent = 0;
    document.getElementById("note20").textContent = 0;
    document.getElementById("status").textContent = "Choisir le niveau";
    return;
  }

  const maxInd = bareme[selected].individuelles;
  const maxCol = bareme[selected].collectives;
  const maxTotal = maxInd + maxCol;

  document.getElementById("maxInd").textContent = maxInd;
  document.getElementById("maxCol").textContent = maxCol;
  document.getElementById("maxTotal").textContent = maxTotal;

  let ind = Number(noteInd.value);
  let col = Number(noteCol.value);

  if (ind > maxInd) ind = maxInd;
  if (col > maxCol) col = maxCol;

  noteInd.value = ind;
  noteCol.value = col;

  const total = ind + col;
  const note20 = maxTotal > 0 ? (total / maxTotal) * 20 : 0;

  document.getElementById("total").textContent = total.toFixed(2);
  document.getElementById("note20").textContent = note20.toFixed(2);

  document.getElementById("status").textContent =
    note20 >= 10 ? "Validé" : "À améliorer";
}

niveau.addEventListener("change", calculer);
noteInd.addEventListener("input", calculer);
noteCol.addEventListener("input", calculer);
