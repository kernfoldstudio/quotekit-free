import { applyOutboundAttribution } from "./calculator.js";

const form = document.querySelector("#estimate-form");
const dateInput = document.querySelector("#estimate-date");
const adjustmentInput = document.querySelector("#template-adjustment");
const subtotalOutput = document.querySelector("#template-subtotal");
const totalOutput = document.querySelector("#template-total");
const printButton = document.querySelector("#print-template");

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function updateTotals() {
  let subtotal = 0;
  form.querySelectorAll(".line-items tbody tr").forEach((row) => {
    const quantity = Math.max(0, number(row.querySelector(".item-qty").value));
    const rate = Math.max(0, number(row.querySelector(".item-rate").value));
    const lineTotal = quantity * rate;
    subtotal += lineTotal;
    row.querySelector(".line-total").textContent = currency.format(lineTotal);
  });
  subtotalOutput.textContent = currency.format(subtotal);
  totalOutput.textContent = currency.format(subtotal + number(adjustmentInput.value));
}

dateInput.value = new Date().toISOString().slice(0, 10);
applyOutboundAttribution();
updateTotals();
form.addEventListener("input", updateTotals);
printButton.addEventListener("click", () => window.print());
