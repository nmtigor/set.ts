/** 80**************************************************************************
 * Utility methods for mathematical operations
 *
 * https://github.com/material-foundation/material-color-utilities/blob/main/typescript/utils/math_utils.ts
 * (2023-06-22)
 *
 * @module lib/color/math_utils
 * @license Apache-2.0
 ******************************************************************************/

/*80--------------------------------------------------------------------------*/

/**
 * The signum function.
 *
 * @return 1 if num > 0, -1 if num < 0, and 0 if num = 0
 */
export function signum(num: number): number {
  if (num < 0) {
    return -1;
  } else if (num === 0) {
    return 0;
  } else {
    return 1;
  }
}

/**
 * The linear interpolation function.
 *
 * @return start if amount = 0 and stop if amount = 1
 */
export function lerp(start: number, stop: number, amount: number): number {
  return (1.0 - amount) * start + amount * stop;
}

/**
 * Clamps an integer between two integers.
 *
 * @return input when min <= input <= max, and either min or max
 * otherwise.
 */
export function clampInt(min: number, max: number, input: number): number {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }

  return input;
}

/**
 * Clamps an integer between two floating-point numbers.
 *
 * @return input when min <= input <= max, and either min or max
 * otherwise.
 */
export function clampDouble(min: number, max: number, input: number): number {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }

  return input;
}

/**
 * Sanitizes a degree measure as an integer.
 *
 * @return a degree measure between 0 (inclusive) and 360
 * (exclusive).
 */
export function sanitizeDegreesInt(degrees: number): number {
  degrees = degrees % 360;
  if (degrees < 0) {
    degrees = degrees + 360;
  }
  return degrees;
}

/**
 * Sanitizes a degree measure as a floating-point number.
 *
 * @return a degree measure between 0.0 (inclusive) and 360.0
 * (exclusive).
 */
export function sanitizeDegreesDouble(degrees: number): number {
  degrees = degrees % 360.0;
  if (degrees < 0) {
    degrees = degrees + 360.0;
  }
  return degrees;
}

/**
 * Sign of direction change needed to travel from one angle to
 * another.
 *
 * For angles that are 180 degrees apart from each other, both
 * directions have the same travel distance, so either direction is
 * shortest. The value 1.0 is returned in this case.
 *
 * @param from The angle travel starts from, in degrees.
 * @param to The angle travel ends at, in degrees.
 * @return -1 if decreasing from leads to the shortest travel
 * distance, 1 if increasing from leads to the shortest travel
 * distance.
 */
export function rotationDirection(from: number, to: number): number {
  const increasingDifference = sanitizeDegreesDouble(to - from);
  return increasingDifference <= 180.0 ? 1.0 : -1.0;
}

/**
 * Distance of two points on a circle, represented using degrees.
 */
export function differenceDegrees(a: number, b: number): number {
  return 180.0 - Math.abs(Math.abs(a - b) - 180.0);
}

/**
 * Multiplies a 1x3 row vector with a 3x3 matrix.
 */
export function matrixMultiply(row: number[], matrix: number[][]): number[] {
  const a = row[0] * matrix[0][0] + row[1] * matrix[0][1] +
    row[2] * matrix[0][2];
  const b = row[0] * matrix[1][0] + row[1] * matrix[1][1] +
    row[2] * matrix[1][2];
  const c = row[0] * matrix[2][0] + row[1] * matrix[2][1] +
    row[2] * matrix[2][2];
  return [a, b, c];
}
/*80--------------------------------------------------------------------------*/
