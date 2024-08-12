import _isGlob from "is-glob";

export const isGlob = (input: string) => {
  if (input.match(/^[A-Za-z]:/) || input.startsWith('\\')) {
    return true;
  }
  if (input.startsWith('.') || input.startsWith('/') || input.startsWith('\\')) {
    return _isGlob(input);
  }
  return false;
}