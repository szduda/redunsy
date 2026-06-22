export const suggestFromOptions = (options: string[]) => (value: string) =>
  options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
