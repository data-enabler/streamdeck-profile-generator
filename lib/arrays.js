/**
 * @fileoverview Helper functions for manipulating arrays and matrices
 */

/**
 * @template {unknown[][]} T
 * @param {T} matrix
 * @returns {T}
 */
function transpose(matrix) {
  if (matrix.length == 0) {
    return matrix;
  }
  return /** @type {T} */ (matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex])));
}

/**
 * @template T
 * @param {number} times
 * @param {T} value
 * @returns {!Array<T>}
 */
function repeat(times, value) {
  if (times < 0) {
    return [];
  }
  return Array(times).fill(value);
}

module.exports = {
  transpose,
  repeat,
};
