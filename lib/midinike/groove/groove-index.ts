/** Map a notation cell index onto the full groove timeline. */
export const grooveSlotIndex = (
  notationCell: number,
  notationCells: number,
  grooveLength: number,
) => Math.min(grooveLength - 1, Math.floor((notationCell * grooveLength) / notationCells))
