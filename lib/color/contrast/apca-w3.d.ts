declare module 'apca-w3' {
  export function APCAcontrast(fgY: number, bgY: number, places?: number): number | string
  export function sRGBtoY(rgb: [number, number, number]): number
}
