import { remove as removeDiacritics } from "diacritics";

export function normalizeText(value: string) {
  return removeDiacritics(value.trim().toLowerCase());
}

export function compactText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function extractNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}