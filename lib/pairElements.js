
// each B or D element is assigned to a key in the pairs object. The key is derived from the element's number without the "B" or "D" prefix. If the element starts with "B", it sets the productName property. If the element starts with "D", it sets the shopName property for the corresponding key.
export default function pairElements(obj) {
  const pairs = [];

  for (const item of obj) {
    const key = item[0].substring(1);
    const value = item[1].v;

    if (item[0].startsWith("B")) {
      pairs.push({ productName: value });
    } else if (item[0].startsWith("D")) {
      const lastPair = pairs[pairs.length - 1];
      lastPair.shopName = value;
    }
  }
  // adding the index+2 to each paired object, representing Google spreadsheet row, for later use:
  const indexedPairs = pairs.map((p, v) => {
    return {
      productName: p.productName,
      shopName: p.shopName,
      cellRow: v+3
    }
  })
  return indexedPairs;
}

