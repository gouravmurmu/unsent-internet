import "server-only";

/**
 * Normalise user text before it's stored: keep newlines, drop other control
 * characters and invisible formatting marks, squash runs of blank lines.
 * Rendering is always plain text (React escapes it), so no HTML is ever kept.
 */
export function cleanText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F​-‏‪-‮⁠-⁤﻿]/g, "")
    .replace(/[  ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
