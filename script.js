const bareme = {
  TC: { individuelles: 6, collectives: 6 },
  "1BAC": { individuelles: 6, collectives: 7 },
  "2BAC": { individuelles: 7, collectives: 7 },
  "1AC": { individuelles: 6, collectives: 8 },
  "2AC": { individuelles: 6, collectives: 7 },
  "3AC": { individuelles: 6, collectives: 6 }
};

let students = JSON.parse(localStorage.getItem("football_students_v2") || "[]");
let editingId = null;

const $ = (id) => document.getElementById(id);

function getFormData() {
  const level = $("studentLevel").value;
  const maxInd = level ? bareme[level].individuelles : 0;
  const maxCol = level ? bareme[level].collectives : 0;

  let noteInd = Number($("noteInd").value || 0);
  let noteCol = Number($("noteCol").value || 0);

  noteInd = Math.max(0, Math.min(noteInd, maxInd));
  noteCol = Math.max(0, Math.min(noteCol, maxCol));

  const totalMax = maxInd + maxCol;
  const total = noteInd + noteCol;
  const note20 = totalMax ? (total / totalMax) * 20 : 0;

  return {
    id: editingId || Date.now(),
    name: $("studentName").value.trim(),
    level,
    date: $("studentDate").value,
    maxInd,
    maxCol,
    noteInd,
    noteCol,
    totalMax,
    total,
    note20
  };
}

function calculate() {
  const d = getFormData();

  $("maxInd").textContent = d.maxInd;
  $("maxCol").textContent = d.maxCol;
  $("totalBrut").textContent = d.total.toFixed(2);
  $("totalMax").textContent = d.totalMax;
  $("note20").textContent = d.note20.toFixed(2);

  $("noteInd").value = d.noteInd;
  $("noteCol").value = d.noteCol;

  $("checkInd").innerHTML = !d.level ? "—" : d.noteInd <= d.maxInd ? '<span class="ok">OK</span>' : '<span class="bad">Erreur</span>';
  $("checkCol").innerHTML = !d.level ? "—" : d.noteCol <= d.maxCol ? '<span class="ok">OK</span>' : '<span class="bad">Erreur</span>';

  let decision = "À compléter";
  if (d.level) decision = d.note20 >= 10 ? "Validé" : "À améliorer";

  $("decision").textContent = decision;
  $("ficheStatus").textContent = decision;
}

function saveStudent() {
  const d = getFormData();

  if (!d.name) {
    alert("Écrire le nom de l'élève.");
    return;
  }
  if (!d.level) {
    alert("Choisir le niveau.");
    return;
  }

  const existingIndex = students.findIndex(s => s.id === d.id);
  if (existingIndex >= 0) {
    students[existingIndex] = d;
  } else {
    students.push(d);
  }

  localStorage.setItem("football_students_v2", JSON.stringify(students));
  editingId = null;
  clearForm();
  renderClassTable();
  switchTab("classe");
}

function clearForm() {
  editingId = null;
  $("studentName").value = "";
  $("studentLevel").value = "";
  $("studentDate").value = "";
  $("noteInd").value = 0;
  $("noteCol").value = 0;
  calculate();
}

function editStudent(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;

  editingId = s.id;
  $("studentName").value = s.name;
  $("studentLevel").value = s.level;
  $("studentDate").value = s.date || "";
  $("noteInd").value = s.noteInd;
  $("noteCol").value = s.noteCol;

  calculate();
  switchTab("fiche");
}

function deleteStudent(id) {
  if (!confirm("Supprimer cet élève ?")) return;
  students = students.filter(s => s.id !== id);
  localStorage.setItem("football_students_v2", JSON.stringify(students));
  renderClassTable();
}

function renderClassTable() {
  const body = $("classBody");
  const query = $("searchInput").value.toLowerCase();
  const level = $("filterLevel").value;

  const filtered = students.filter(s => {
    const matchName = s.name.toLowerCase().includes(query);
    const matchLevel = !level || s.level === level;
    return matchName && matchLevel;
  });

  $("studentCount").textContent = `${filtered.length} élève${filtered.length > 1 ? "s" : ""}`;

  body.innerHTML = filtered.map((s, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${s.level}</td>
      <td>${s.noteInd} / ${s.maxInd}</td>
      <td>${s.noteCol} / ${s.maxCol}</td>
      <td>${s.total.toFixed(2)} / ${s.totalMax}</td>
      <td><strong>${s.note20.toFixed(2)}</strong></td>
      <td>${s.note20 >= 10 ? '<span class="ok">Validé</span>' : '<span class="warn">À améliorer</span>'}</td>
      <td>
        <button class="btn secondary small-btn" onclick="editStudent(${s.id})">Modifier</button>
        <button class="btn danger small-btn" onclick="deleteStudent(${s.id})">Supprimer</button>
      </td>
    </tr>
  `).join("");
}

function exportCSV() {
  const headers = ["Nom élève", "Niveau", "Date", "Individuelles", "Collectives", "Total brut", "Total max", "Note /20", "Décision"];
  const rows = students.map(s => [
    s.name, s.level, s.date, s.noteInd, s.noteCol, s.total.toFixed(2), s.totalMax, s.note20.toFixed(2), s.note20 >= 10 ? "Validé" : "À améliorer"
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "grille_classe_football.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll() {
  if (!confirm("Supprimer tous les élèves sauvegardés ?")) return;
  students = [];
  localStorage.removeItem("football_students_v2");
  renderClassTable();
}

function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === tabName));
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function(m) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m];
  });
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

["studentLevel", "noteInd", "noteCol"].forEach(id => $(id).addEventListener("input", calculate));
$("saveStudentBtn").addEventListener("click", saveStudent);
$("clearFormBtn").addEventListener("click", clearForm);
$("searchInput").addEventListener("input", renderClassTable);
$("filterLevel").addEventListener("change", renderClassTable);
$("exportBtn").addEventListener("click", exportCSV);
$("printBtn").addEventListener("click", () => window.print());
$("resetBtn").addEventListener("click", resetAll);

calculate();
renderClassTable();
