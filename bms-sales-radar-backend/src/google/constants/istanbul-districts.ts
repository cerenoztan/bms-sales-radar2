export const ISTANBUL_DISTRICTS = [
  'Arnavutköy',
  'Beşiktaş',
  'Beyoğlu',
  'Kadıköy',
  'Sarıyer',
  'Şişli',
  'Üsküdar',
] as const;

export type IstanbulDistrict =
  (typeof ISTANBUL_DISTRICTS)[number];