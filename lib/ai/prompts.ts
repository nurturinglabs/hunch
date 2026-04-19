// Prompt loader: reads versioned prompt files from /prompts and performs
// simple {{SLOT}} substitution. Keeps prompts out of code so they can be
// iterated without redeploys.

import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

export type PromptName = "diagnostic-v1" | "report-v1";

export function loadPrompt(name: PromptName): string {
  const p = path.join(PROMPTS_DIR, `${name}.md`);
  return fs.readFileSync(p, "utf8");
}

export function fillSlots(template: string, slots: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in slots)) {
      throw new Error(`Missing prompt slot: ${key}`);
    }
    return slots[key];
  });
}
