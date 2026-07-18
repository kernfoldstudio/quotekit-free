import test from "node:test";
import assert from "node:assert/strict";

import { attributedStoreUrl, calculateQuote, formatCurrency } from "./calculator.js";

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

test("carries safe inbound attribution to the Gumroad link", () => {
  const result = new URL(attributedStoreUrl(
    "https://kernfold.gumroad.com/l/quotekit-pro-mobile-detailing?utm_source=kernfold_site&utm_campaign=quote_builder",
    "https://kernfoldstudio.github.io/quotekit-free/?utm_source=instagram&utm_medium=organic_social&utm_campaign=profile&utm_content=bio",
  ));

  assert.equal(result.searchParams.get("utm_source"), "instagram");
  assert.equal(result.searchParams.get("utm_medium"), "organic_social");
  assert.equal(result.searchParams.get("utm_campaign"), "profile");
  assert.equal(result.searchParams.get("utm_content"), "bio");
});

test("keeps fallback attribution when the landing page has no UTM values", () => {
  const result = new URL(attributedStoreUrl(
    "https://kernfold.gumroad.com/l/quotekit-pro-mobile-detailing?utm_source=kernfold_site&utm_campaign=quote_template",
    "https://kernfoldstudio.github.io/quotekit-free/quote-template.html",
  ));

  assert.equal(result.searchParams.get("utm_source"), "kernfold_site");
  assert.equal(result.searchParams.get("utm_campaign"), "quote_template");
});

test("preserves CTA placement while carrying the inbound source", () => {
  const result = new URL(attributedStoreUrl(
    "https://kernfold.gumroad.com/l/quotekit-pro-mobile-detailing?utm_source=kernfold_site&utm_campaign=quote_builder&utm_content=post_quote",
    "https://kernfoldstudio.github.io/quotekit-free/?utm_source=pinterest&utm_medium=organic&utm_campaign=checklist&utm_content=pin_05",
  ));

  assert.equal(result.searchParams.get("utm_source"), "pinterest");
  assert.equal(result.searchParams.get("utm_medium"), "organic");
  assert.equal(result.searchParams.get("utm_campaign"), "checklist");
  assert.equal(result.searchParams.get("utm_content"), "post_quote");
});

test("ignores malformed attribution values", () => {
  const result = new URL(attributedStoreUrl(
    "https://kernfold.gumroad.com/l/quotekit-pro-mobile-detailing?utm_source=kernfold_site",
    "https://kernfoldstudio.github.io/quotekit-free/?utm_source=%3Cscript%3E&utm_campaign=valid_campaign",
  ));

  assert.equal(result.searchParams.get("utm_source"), "kernfold_site");
  assert.equal(result.searchParams.get("utm_campaign"), "valid_campaign");
});
