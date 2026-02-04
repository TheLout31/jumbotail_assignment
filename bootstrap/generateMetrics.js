module.exports = function generateMetrics() {
  return {
    rating: +(Math.random() * 2 + 3).toFixed(1), 
    reviewCount: Math.floor(Math.random() * 5000),
    sales: Math.floor(Math.random() * 100000),
    returnRate: +(Math.random() * 0.3).toFixed(2), 
    complaints: Math.floor(Math.random() * 200),
    popularityScore: Math.floor(Math.random() * 100)
  };
};
