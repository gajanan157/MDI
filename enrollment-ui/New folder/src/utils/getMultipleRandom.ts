/**
 * Returns a random subset of elements from the input array.
 *
 * @param arr The array to pick random elements from.
 * @param num The number of random elements to return.
 * @returns A new array containing the random subset of elements.
 * @throws If `arr` is not an array or `num` is not a valid number.
 */
function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;

  const buffer = new Uint32Array(1);
  const max = 2 ** 32;
  const limit = max - (max % maxExclusive);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % maxExclusive;
}

export function getMultipleRandom<T>(arr: T[], num: number): T[] {
  if (!Array.isArray(arr)) {
    throw new TypeError("Input must be an array.");
  }

  if (!Number.isFinite(num) || num < 0 || num > arr.length) {
    throw new Error(
      "Number of elements to pick must be a non-negative number less than or equal to the length of the array.",
    );
  }

  if (num === 0) return [];

  const picked = [...arr];
  for (let i = 0; i < num; i++) {
    const j = i + randomInt(picked.length - i);
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked.slice(0, num);
}
