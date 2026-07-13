import test from "node:test";
import assert from "node:assert/strict";

import { calculateQuote, formatCurrency } from "./calculator.js";

test("calculates the base maintenance quote", () => {
  const quote = calculateQuote({
    packageId: "maintenance",
    vehicleSizeId: "compact",
    conditionId: "maintained",
  });

  assert.equal(quote.total, 95);
  assert.equal(quote.addOnTotal, 0);
});

test("applies vehicle and condition multipliers before add-ons", () => {
  const quote = calculateQuote({
    packageId: "complete",
    vehicleSizeId: "large",
    conditionId: "heavy",
    addOnIds: ["petHair", "engineBay"],
    travelFee: 20,
  });

  assert.equal(quote.basePrice, 235);
  assert.equal(quote.addOnTotal, 95);
  assert.equal(quote.total, 543);
});

test("rejects unknown options and negative fees", () => {
  assert.throws(
    () =>
      calculateQuote({
        packageId: "unknown",
        vehicleSizeId: "compact",
        conditionId: "maintained",
      }),
    /Unknown package/,
  );

  assert.throws(
    () =>
      calculateQuote({
        packageId: "interior",
        vehicleSizeId: "compact",
        conditionId: "maintained",
        travelFee: -1,
      }),
    /non-negative/,
  );
});

test("formats whole-dollar US prices", () => {
  assert.equal(formatCurrency(235), "$235");
});

