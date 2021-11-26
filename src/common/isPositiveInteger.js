/**
 * @param {string} str 
 * @returns 
 */
const isPositiveInteger = (str) => {
  const num = Number(str)
  return Number.isInteger(num) && num > 0;
};

module.exports = { isPositiveInteger };
