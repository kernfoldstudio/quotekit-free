export const packages = {
  maintenance: {
    name: "Maintenance detail",
    description: "Light interior reset and exterior wash for maintained vehicles.",
    basePrice: 95,
  },
  interior: {
    name: "Interior detail",
    description: "Vacuum, surfaces, glass, mats, and focused interior cleaning.",
    basePrice: 145,
  },
  exterior: {
    name: "Exterior detail",
    description: "Wash, decontamination, wheels, tires, glass, and protection.",
    basePrice: 135,
  },
  complete: {
    name: "Complete detail",
    description: "Interior and exterior service combined in one visit.",
    basePrice: 235,
  },
};

export const vehicleSizes = {
  compact: { name: "Compact / sedan", multiplier: 1 },
  midsize: { name: "Midsize SUV / crossover", multiplier: 1.15 },
  large: { name: "Large SUV / truck", multiplier: 1.3 },
  van: { name: "Minivan / three-row", multiplier: 1.35 },
};

export const conditions = {
  maintained: { name: "Maintained", multiplier: 1 },
  average: { name: "Average use", multiplier: 1.15 },
  heavy: { name: "Heavy soil", multiplier: 1.4 },
};

export const addOns = {
  petHair: { name: "Pet-hair removal", price: 45 },
  stainTreatment: { name: "Focused stain treatment", price: 35 },
  engineBay: { name: "Engine-bay cleaning", price: 50 },
  headlight: { name: "Headlight restoration", price: 75 },
  spraySealant: { name: "Extended spray sealant", price: 40 },
};

function assertCatalogKey(catalog, key, label) {
  if (!catalog[key]) {
    throw new Error(`Unknown ${label}: ${key}`);
  }
}

function asNonNegativeNumber(value, label) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
  return number;
}

export function calculateQuote({
  packageId,
  vehicleSizeId,
  conditionId,
  addOnIds = [],
  travelFee = 0,
}) {
  assertCatalogKey(packages, packageId, "package");
  assertCatalogKey(vehicleSizes, vehicleSizeId, "vehicle size");
  assertCatalogKey(conditions, conditionId, "condition");

  const selectedAddOns = addOnIds.map((id) => {
    assertCatalogKey(addOns, id, "add-on");
    return { id, ...addOns[id] };
  });

  const basePrice = packages[packageId].basePrice;
  const sizeAdjustment = basePrice * (vehicleSizes[vehicleSizeId].multiplier - 1);
  const sizedPrice = basePrice + sizeAdjustment;
  const conditionAdjustment = sizedPrice * (conditions[conditionId].multiplier - 1);
  const addOnTotal = selectedAddOns.reduce((total, item) => total + item.price, 0);
  const normalizedTravelFee = asNonNegativeNumber(travelFee, "Travel fee");
  const total = Math.round(sizedPrice + conditionAdjustment + addOnTotal + normalizedTravelFee);

  return {
    package: { id: packageId, ...packages[packageId] },
    vehicleSize: { id: vehicleSizeId, ...vehicleSizes[vehicleSizeId] },
    condition: { id: conditionId, ...conditions[conditionId] },
    selectedAddOns,
    basePrice,
    sizeAdjustment,
    conditionAdjustment,
    addOnTotal,
    travelFee: normalizedTravelFee,
    total,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

