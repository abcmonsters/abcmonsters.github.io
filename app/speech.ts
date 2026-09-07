export function pickEnglishVoice<
  T extends { name: string; lang: string; localService?: boolean },
>(voices: readonly T[]): T | undefined {
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const score = (v: T) =>
    (/google/i.test(v.name) ? 100 : 0) +
    (/en[-_]US/i.test(v.lang) ? 20 : 0) +
    (/natural|premium|enhanced|neural/i.test(v.name) ? 10 : 0) +
    (!v.localService ? 3 : 0);
  return [...english].sort((a, b) => score(b) - score(a))[0];
}
