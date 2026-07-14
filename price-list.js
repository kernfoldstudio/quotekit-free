import { applyOutboundAttribution } from "./calculator.js";

const printButton = document.querySelector("#print-price-list");

applyOutboundAttribution();
printButton.addEventListener("click", () => window.print());
