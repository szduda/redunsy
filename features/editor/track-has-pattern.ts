export const barHasPattern = (bar: string) => bar.replace(/-/g, '').length > 0

export const trackHasPattern = (bars: string[]) => bars.some(barHasPattern)
