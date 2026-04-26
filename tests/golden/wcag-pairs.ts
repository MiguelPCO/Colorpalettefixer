// Reference pairs from WebAIM Contrast Checker
// https://webaim.org/resources/contrastchecker/
export const WCAG_GOLDEN = [
  { fg: '#000000', bg: '#ffffff', ratio: 21 },
  { fg: '#777777', bg: '#ffffff', ratio: 4.48 },
  { fg: '#1a73e8', bg: '#ffffff', ratio: 4.65 },
  { fg: '#ffffff', bg: '#1a73e8', ratio: 4.65 },
  { fg: '#ff0000', bg: '#ffffff', ratio: 3.99 },
  { fg: '#00ff00', bg: '#ffffff', ratio: 1.37 },
  { fg: '#0000ff', bg: '#ffffff', ratio: 8.59 },
  { fg: '#ffff00', bg: '#000000', ratio: 19.56 },
  { fg: '#ff6600', bg: '#ffffff', ratio: 3.09 },
  { fg: '#333333', bg: '#ffffff', ratio: 12.63 },
] as const
