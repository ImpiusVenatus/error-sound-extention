export function triggerTypeError() {
  // Intentional TypeScript error: assigning string to number
  const value: number = "this is not a number";
  return value;
}

