function calculateScore(product, queryTokens) {
  let score = 0;

  const title = (product.title || "").toLowerCase();
  const description = (product.description || "").toLowerCase();

  queryTokens.forEach(token => {
    if (title.includes(token)) score += 30;
    if (description.includes(token)) score += 10;
  });

  // Cheap price boost
  if (queryTokens.includes("sasta")) {
    const price = product.price ?? Infinity;
    score += Math.max(0, 80000 - price) / 1000;
  }

  // ⭐ FIX: rating from metrics
  const rating = product.rating || product.metrics?.rating;
  if (rating) {
    score += rating * 5;
  }

  // ⭐ FIX: stock default
  const stock = product.stock ?? 1;
  if (stock === 0) {
    score -= 50;
  }

  // Accessory penalty
  if (title.includes("cover") || title.includes("case")) {
    score -= 20;
  }

  return score;
}

module.exports = {calculateScore}
