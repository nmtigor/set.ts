/** 80**************************************************************************
 * Color science utilities
 *
 * Utility methods for color science constants and color space
 * conversions that aren't HCT or CAM16.
 *
 * https://github.com/material-foundation/material-color-utilities/blob/main/typescript/utils/color_utils.ts
 * (2024-07-21)
 *
 * @module lib/color/color_utils
 * @license MIT
 ******************************************************************************/

import type { uint32, uint8 } from "../alias.ts";
import type { red_t } from "./alias.ts";
import { clampInt, matrixMultiply } from "./math_utils.ts";
/*80--------------------------------------------------------------------------*/

const SRGB_TO_XYZ = [
  [0.41233895, 0.35762064, 0.18051042],
  [0.2126, 0.7152, 0.0722],
  [0.01932141, 0.11916382, 0.95034478],
];

const XYZ_TO_SRGB = [
  [
    3.2413774792388685,
    -1.5376652402851851,
    -0.49885366846268053,
  ],
  [
    -0.9691452513005321,
    1.8758853451067872,
    0.04156585616912061,
  ],
  [
    0.05562093689691305,
    -0.20395524564742123,
    1.0571799111220335,
  ],
];

const WHITE_POINT_D65 = [95.047, 100.0, 108.883];

/**
 * Converts a color from RGB components to ARGB format.
 */
export function argbFromRgb(red: red_t, green: red_t, blue: red_t): uint32 {
  return (255 << 24 |
    (red & 255) << 16 | (green & 255) << 8 | blue & 255) >>> 0;
}

/**
 * Converts a color from linear RGB components to ARGB format.
 */
export function argbFromLinrgb(linrgb: number[]): uint32 {
  const r = delinearized(linrgb[0]);
  const g = delinearized(linrgb[1]);
  const b = delinearized(linrgb[2]);
  return argbFromRgb(r, g, b);
}

/**
 * Returns the alpha component of a color in ARGB format.
 */
export function alphaFromArgb(argb: uint32): uint8 {
  return argb >> 24 & 255;
}

/**
 * Returns the red component of a color in ARGB format.
 */
export function redFromArgb(argb: uint32): uint8 {
  return argb >> 16 & 255;
}

/**
 * Returns the green component of a color in ARGB format.
 */
export function greenFromArgb(argb: uint32): uint8 {
  return argb >> 8 & 255;
}

/**
 * Returns the blue component of a color in ARGB format.
 */
export function blueFromArgb(argb: uint32): uint8 {
  return argb & 255;
}

/**
 * Returns whether a color in ARGB format is opaque.
 */
export function isOpaque(argb: number): boolean {
  return alphaFromArgb(argb) >= 255;
}

/**
 * Converts a color from ARGB to XYZ.
 */
export function argbFromXyz(x: number, y: number, z: number): uint32 {
  const matrix = XYZ_TO_SRGB;
  const linearR = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
  const linearG = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
  const linearB = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
  const r = delinearized(linearR);
  const g = delinearized(linearG);
  const b = delinearized(linearB);
  return argbFromRgb(r, g, b);
}

/**
 * Converts a color from XYZ to ARGB.
 */
export function xyzFromArgb(argb: uint32): number[] {
  const r = linearized(redFromArgb(argb));
  const g = linearized(greenFromArgb(argb));
  const b = linearized(blueFromArgb(argb));
  return matrixMultiply([r, g, b], SRGB_TO_XYZ);
}

/**
 * Converts a color represented in Lab color space into an ARGB
 * integer.
 */
export function argbFromLab(l: number, a: number, b: number): number {
  const whitePoint = WHITE_POINT_D65;
  const fy = (l + 16.0) / 116.0;
  const fx = a / 500.0 + fy;
  const fz = fy - b / 200.0;
  const xNormalized = labInvf(fx);
  const yNormalized = labInvf(fy);
  const zNormalized = labInvf(fz);
  const x = xNormalized * whitePoint[0];
  const y = yNormalized * whitePoint[1];
  const z = zNormalized * whitePoint[2];
  return argbFromXyz(x, y, z);
}

/**
 * Converts a color from ARGB representation to L*a*b*
 * representation.
 *
 * @param argb the ARGB representation of a color
 * @return a Lab object representing the color
 */
export function labFromArgb(argb: number): number[] {
  const linearR = linearized(redFromArgb(argb));
  const linearG = linearized(greenFromArgb(argb));
  const linearB = linearized(blueFromArgb(argb));
  const matrix = SRGB_TO_XYZ;
  const x = matrix[0][0] * linearR + matrix[0][1] * linearG +
    matrix[0][2] * linearB;
  const y = matrix[1][0] * linearR + matrix[1][1] * linearG +
    matrix[1][2] * linearB;
  const z = matrix[2][0] * linearR + matrix[2][1] * linearG +
    matrix[2][2] * linearB;
  const whitePoint = WHITE_POINT_D65;
  const xNormalized = x / whitePoint[0];
  const yNormalized = y / whitePoint[1];
  const zNormalized = z / whitePoint[2];
  const fx = labF(xNormalized);
  const fy = labF(yNormalized);
  const fz = labF(zNormalized);
  const l = 116.0 * fy - 16;
  const a = 500.0 * (fx - fy);
  const b = 200.0 * (fy - fz);
  return [l, a, b];
}

/**
 * Converts an L* value to an ARGB representation.
 *
 * @param lstar L* in L*a*b*
 * @return ARGB representation of grayscale color with lightness
 * matching L*
 */
export function argbFromLstar(lstar: number): number {
  const y = yFromLstar(lstar);
  const component = delinearized(y);
  return argbFromRgb(component, component, component);
}

/**
 * Computes the L* value of a color in ARGB representation.
 *
 * @param argb ARGB representation of a color
 * @return L*, from L*a*b*, coordinate of the color
 */
export function lstarFromArgb(argb: uint32): number {
  const y = xyzFromArgb(argb)[1];
  return 116.0 * labF(y / 100.0) - 16.0;
}

/**
 * Converts an L* value to a Y value.
 *
 * L* in L*a*b* and Y in XYZ measure the same quantity, luminance.
 *
 * L* measures perceptual luminance, a linear scale. Y in XYZ
 * measures relative luminance, a logarithmic scale.
 *
 * @param lstar L* in L*a*b*
 * @return Y in XYZ
 */
export function yFromLstar(lstar: number): number {
  return 100.0 * labInvf((lstar + 16.0) / 116.0);
}

/**
 * Converts a Y value to an L* value.
 *
 * L* in L*a*b* and Y in XYZ measure the same quantity, luminance.
 *
 * L* measures perceptual luminance, a linear scale. Y in XYZ
 * measures relative luminance, a logarithmic scale.
 *
 * @param y Y in XYZ
 * @return L* in L*a*b*
 */
export function lstarFromY(y: number): number {
  return labF(y / 100.0) * 116.0 - 16.0;
}

/**
 * Linearizes an RGB component.
 *
 * @param rgbComponent 0 <= rgb_component <= 255, represents R/G/B
 * channel
 * @return 0.0 <= output <= 100.0, color channel converted to
 * linear RGB space
 */
export function linearized(rgbComponent: uint8): number {
  const normalized = rgbComponent / 255.0;
  if (normalized <= 0.040449936) {
    return normalized / 12.92 * 100.0;
  } else {
    return Math.pow((normalized + 0.055) / 1.055, 2.4) * 100.0;
  }
}

/**
 * Delinearizes an RGB component.
 *
 * @param rgbComponent 0.0 <= rgb_component <= 100.0, represents
 * linear R/G/B channel
 * @return 0 <= output <= 255, color channel converted to regular
 * RGB space
 */
export function delinearized(rgbComponent: number): uint8 {
  const normalized = rgbComponent / 100.0;
  let delinearized = 0.0;
  if (normalized <= 0.0031308) {
    delinearized = normalized * 12.92;
  } else {
    delinearized = 1.055 * Math.pow(normalized, 1.0 / 2.4) - 0.055;
  }
  return clampInt(0, 255, Math.round(delinearized * 255.0));
}

/**
 * Returns the standard white point; white on a sunny day.
 *
 * @return The white point
 */
export function whitePointD65(): number[] {
  return WHITE_POINT_D65;
}

function labF(t: number): number {
  const e = 216.0 / 24389.0;
  const kappa = 24389.0 / 27.0;
  if (t > e) {
    return Math.pow(t, 1.0 / 3.0);
  } else {
    return (kappa * t + 16) / 116;
  }
}

function labInvf(ft: number): number {
  const e = 216.0 / 24389.0;
  const kappa = 24389.0 / 27.0;
  const ft3 = ft * ft * ft;
  if (ft3 > e) {
    return ft3;
  } else {
    return (116 * ft - 16) / kappa;
  }
}
/*80--------------------------------------------------------------------------*/
