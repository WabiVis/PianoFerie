import {
  fetchTeamMembers,
  fetchVacations,
  fetchHolidays
} from "./api.js";

const plannerMonthSelect = document.getElementById("planner-month-select");
const plannerContainer = document.getElementById("planner-container");

let allMembers = [];
let allVacations = [];
let holidays = [];

function initPlannerMonthSelect() {
  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  monthNames.forEach((name, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = name;
    plannerMonthSelect.appendChild(opt);
  });

  plannerMonthSelect.value = 0;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function renderPlanner(monthIndex) {
  const year = 2026;

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const numDays = lastDay.getDate();

  const holidaysSet = new Set(holidays.map(h => h.data));

  const table = document.createElement("table");
  table.className = "planner-table";

  // HEADER
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const thPerson = document.createElement("th");
  thPerson.className = "person";
  thPerson.textContent = "";
  headRow.appendChild(thPerson);

  for (let day = 1; day <= numDays; day++) {
    const date = new Date(year, monthIndex, day);
    const iso = formatDate(date);
    const th = document.createElement("th");
    th.textContent = `${day}-${String(monthIndex+1).padStart(2,'0')}`;
    headRow.appendChild(th);
  }

  thead.appendChild(headRow);
  table.appendChild(thead);

  // BODY
  const tbody = document.createElement("tbody");

  allMembers.forEach(member => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = `${member.nome} ${member.cognome}`;
    tdName.className = "person";
    tr.appendChild(tdName);

    // filtra ferie di questo membro
    const vacMember = allVacations.filter(v => v.memberId == member.id);

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, monthIndex, day);
      const iso = formatDate(date);
      const weekday = date.getDay();

      const td = document.createElement("td");

      // weekend
      if (weekday === 0) td.classList.add("weekend-cell");
      if (weekday === 6) td.classList.add("weekend-cell");

      // festività
      if (holidaysSet.has(iso)) td.classList.add("holiday-cell");

      // cerca se la data è dentro selezione ferie
      const entry = vacMember.find(v => {
        return iso >= v.dataInizio && iso <= v.dataFine;
      });

      if (entry) {
        td.textContent = entry.giorniCalcolati === 1 ? "1" : entry.stato;

        td.classList.add("vacation-cell");
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  plannerContainer.innerHTML = "";
  plannerContainer.appendChild(table);
}

export async function initPlanner() {
  const [members, vacations, hols] = await Promise.all([
    fetchTeamMembers(),
    fetchVacations(),
    fetchHolidays()
  ]);

  allMembers = members;
  allVacations = vacations;
  holidays = hols;

  initPlannerMonthSelect();
  renderPlanner(Number(plannerMonthSelect.value));

  plannerMonthSelect.addEventListener("change", () => {
    renderPlanner(Number(plannerMonthSelect.value));
  });
}

document.addEventListener("DOMContentLoaded", initPlanner);
