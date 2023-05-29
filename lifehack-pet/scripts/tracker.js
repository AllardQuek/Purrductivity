let map = new Map();
let rowNr = 0;
let displayTimer = null;
let collectionDate = null;

document.addEventListener("DOMContentLoaded", async () => {
  const { collectionDate: date } = await chrome.storage.local.get(
    "collectionDate"
  );
  collectionDate = date;
  document.getElementById(
    "collectionDate"
  ).innerHTML = `Data collected since  <b>${collectionDate}</b>`;

  setInterval(async () => {
    const { tracker } = await chrome.storage.local.get("tracker");
    map = new Map(Object.entries(tracker));
    removeAllRowsTable();
    for (const [site, time] of map) {
      addToTable(site, time);
    }
  }, 1000);
});

function removeAllRowsTable() {
  const table = document.getElementById("myTable");
  for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

function addToTable(site, time) {
  const tbody = document
    .getElementById("myTable")
    .getElementsByTagName("tbody")[0];
  const row = tbody.insertRow();
  const siteCell = row.insertCell();
  const timeCell = row.insertCell();
  siteCell.textContent = site;
  timeCell.textContent = showTime(time);
}

function showTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 1) {
    seconds %= 60;
    const hours = Math.floor(minutes / 60);
    if (hours >= 1) {
      minutes %= 60;
      return `${formatDigit(hours)} hrs: ${formatDigit(
        minutes
      )} mins : ${formatDigit(seconds)} secs`;
    } else {
      return `00 hrs: ${formatDigit(minutes)} mins : ${formatDigit(
        seconds
      )} secs`;
    }
  } else {
    return `00 hrs: 00 mins : ${formatDigit(seconds)} secs`;
  }
}

function formatDigit(digit) {
  return digit < 10 ? `0${digit}` : digit;
}
