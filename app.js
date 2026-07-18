import {
  addOns,
  applyOutboundAttribution,
  calculateQuote,
  conditions,
  formatCurrency,
  packages,
  vehicleSizes,
} from "./calculator.js";

const form = document.querySelector("#quote-form");
const packageOptions = document.querySelector("#package-options");
const addonOptions = document.querySelector("#addon-options");
const vehicleSelect = document.querySelector("#vehicle-size");
const conditionSelect = document.querySelector("#condition");
const customerInput = document.querySelector("#customer-name");
const travelInput = document.querySelector("#travel-fee");
const quoteLines = document.querySelector("#quote-lines");
const quoteTotal = document.querySelector("#quote-total");
const outputCustomer = document.querySelector("#output-customer");
const outputContext = document.querySelector("#output-context");
const quoteNumber = document.querySelector("#quote-number");
const copyButton = document.querySelector("#copy-quote");
const printButton = document.querySelector("#print-quote");
const loadSampleButton = document.querySelector("#load-sample");
const actionStatus = document.querySelector("#action-status");

let currentQuote;

function optionMarkup(value, item) {
  return `<option value="${value}">${item.name}</option>`;
}

function renderControls() {
  vehicleSelect.innerHTML = Object.entries(vehicleSizes)
    .map(([id, item]) => optionMarkup(id, item))
    .join("");

  conditionSelect.innerHTML = Object.entries(conditions)
    .map(([id, item]) => optionMarkup(id, item))
    .join("");

  packageOptions.innerHTML = Object.entries(packages)
    .map(
      ([id, item], index) => `
        <label class="choice-card">
          <input type="radio" name="package" value="${id}" ${index === 0 ? "checked" : ""} />
          <span class="choice-card-body">
            <span class="choice-card-topline">
              <strong>${item.name}</strong>
              <span>${formatCurrency(item.basePrice)}+</span>
            </span>
            <small>${item.description}</small>
          </span>
        </label>
      `,
    )
    .join("");

  addonOptions.innerHTML = Object.entries(addOns)
    .map(
      ([id, item]) => `
        <label class="addon-row">
          <span>
            <input type="checkbox" name="addons" value="${id}" />
            <span>${item.name}</span>
          </span>
          <strong>+${formatCurrency(item.price)}</strong>
        </label>
      `,
    )
    .join("");
}

function makeQuoteNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const time = `${now.getHours()}`.padStart(2, "0") + `${now.getMinutes()}`.padStart(2, "0");
  return `KF-${date}-${time}`;
}

function lineItem(label, amount, muted = false) {
  const row = document.createElement("div");
  row.className = `quote-line${muted ? " quote-line-muted" : ""}`;

  const name = document.createElement("span");
  name.textContent = label;
  const price = document.createElement("strong");
  price.textContent = formatCurrency(amount);

  row.append(name, price);
  return row;
}

function selectedPackageId() {
  return form.elements.package.value;
}

function selectedAddOnIds() {
  return [...form.querySelectorAll('input[name="addons"]:checked')].map((input) => input.value);
}

function updateQuote() {
  currentQuote = calculateQuote({
    packageId: selectedPackageId(),
    vehicleSizeId: vehicleSelect.value,
    conditionId: conditionSelect.value,
    addOnIds: selectedAddOnIds(),
    travelFee: travelInput.value,
  });

  outputCustomer.textContent = customerInput.value.trim() || "Your customer";
  outputContext.textContent = `${currentQuote.vehicleSize.name} · ${currentQuote.condition.name}`;
  quoteLines.replaceChildren();
  quoteLines.append(lineItem(currentQuote.package.name, currentQuote.basePrice));

  if (Math.abs(currentQuote.sizeAdjustment) >= 0.5) {
    quoteLines.append(lineItem("Vehicle-size adjustment", currentQuote.sizeAdjustment, true));
  }
  if (Math.abs(currentQuote.conditionAdjustment) >= 0.5) {
    quoteLines.append(lineItem("Condition adjustment", currentQuote.conditionAdjustment, true));
  }
  currentQuote.selectedAddOns.forEach((item) => {
    quoteLines.append(lineItem(item.name, item.price));
  });
  if (currentQuote.travelFee > 0) {
    quoteLines.append(lineItem("Travel fee", currentQuote.travelFee));
  }

  quoteTotal.textContent = formatCurrency(currentQuote.total);
}

function buildCopyText() {
  const customer = customerInput.value.trim();
  const greeting = customer ? `Hi ${customer},` : "Hello,";
  const addOnText = currentQuote.selectedAddOns.length
    ? `\nAdd-ons: ${currentQuote.selectedAddOns.map((item) => item.name).join(", ")}`
    : "";

  return `${greeting}\n\nHere is your detailing estimate:\n${currentQuote.package.name} — ${currentQuote.vehicleSize.name}, ${currentQuote.condition.name}${addOnText}\n\nEstimated total: ${formatCurrency(currentQuote.total)}\n\nFinal price may change after an in-person inspection or a material change in scope. Taxes are not included.`;
}

async function copyQuote() {
  try {
    await navigator.clipboard.writeText(buildCopyText());
    actionStatus.textContent = "Quote copied to clipboard.";
  } catch {
    actionStatus.textContent = "Copy was blocked by the browser. Select the quote text manually.";
  }
}

function loadSampleQuote() {
  customerInput.value = "Maya";
  vehicleSelect.value = "midsize";
  conditionSelect.value = "average";
  travelInput.value = "15";
  form.querySelector('input[name="package"][value="complete"]').checked = true;
  form.querySelectorAll('input[name="addons"]').forEach((input) => {
    input.checked = input.value === "petHair" || input.value === "spraySealant";
  });
  updateQuote();
  actionStatus.textContent = "Sample loaded. Change any field to make it yours.";
  document.querySelector("#quote-card").scrollIntoView({ behavior: "smooth", block: "center" });
}

renderControls();
applyOutboundAttribution();
quoteNumber.textContent = makeQuoteNumber();
updateQuote();

form.addEventListener("input", updateQuote);
form.addEventListener("change", updateQuote);
copyButton.addEventListener("click", copyQuote);
printButton.addEventListener("click", () => window.print());
loadSampleButton.addEventListener("click", loadSampleQuote);
