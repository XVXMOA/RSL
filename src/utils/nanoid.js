// Lightweight nanoid replacement so we do not need the external dependency.
// This keeps IDs consistent across environments and works in React Native as well.
export const nanoid = (size = 8) =>
  Array.from({ length: size }, () =>
    Math.floor(Math.random() * 36)
      .toString(36)
      .toUpperCase()
  ).join('');
