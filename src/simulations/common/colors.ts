/**
 * Palette sémantique unifiée pour les schémas 2D/3D (mode standard et daltonien Okabe-Ito)
 */
export interface SimColorPalette {
  addressHex: number;
  addressCss: string;
  dataHex: number;
  dataCss: string;
  controlHex: number;
  controlCss: string;
  okHex: number;
  okCss: string;
  cpuBody: number;
  ramBody: number;
  romBody: number;
  periphBody: number;
  freeBody: number;
  decoderBody: number;
  boardBase: number;
  boardGrid: number;
}

export function getSimColors(colorBlind: boolean, isDark: boolean): SimColorPalette {
  return {
    addressHex: colorBlind ? 0x0072b2 : 0x2563eb,
    addressCss: colorBlind ? '#0072B2' : '#2563EB',
    dataHex: colorBlind ? 0xd55e00 : 0xdc2626,
    dataCss: colorBlind ? '#D55E00' : '#DC2626',
    controlHex: colorBlind ? 0xe69f00 : 0xea580c,
    controlCss: colorBlind ? '#E69F00' : '#EA580C',
    okHex: colorBlind ? 0x009e73 : 0x059669,
    okCss: colorBlind ? '#009E73' : '#059669',
    cpuBody: isDark ? 0x1e293b : 0x334155,
    ramBody: isDark ? 0x0f766e : 0x0d9488,
    romBody: isDark ? 0x4338ca : 0x4f46e5,
    periphBody: isDark ? 0x0369a1 : 0x0284c7,
    freeBody: isDark ? 0x334155 : 0x94a3b8,
    decoderBody: isDark ? 0x7c2d12 : 0xc2410c,
    boardBase: isDark ? 0x0f172a : 0xe2e8f0,
    boardGrid: isDark ? 0x1e293b : 0xcbd5e1,
  };
}
