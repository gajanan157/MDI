export type ParsedJobErrorSection = {
  title: string;
  bullets: string[];
  lines: string[];
};

const BULLET_PREFIX = /^[-*•]\s*/;

function isBulletLine(line: string): boolean {
  return BULLET_PREFIX.test(line.trim());
}

function stripBullet(line: string): string {
  return line.trim().replace(BULLET_PREFIX, "").trim();
}

function isSectionHeader(line: string): boolean {
  return line.trim().endsWith(":");
}

/** Parses `technicalDetail` into display sections with bullet lists. */
export function parseJobTechnicalDetail(technicalDetail: string): ParsedJobErrorSection[] {
  const rawLines = technicalDetail
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length === 0) return [];

  const sections: ParsedJobErrorSection[] = [];
  let current: ParsedJobErrorSection | null = null;

  const pushCurrent = () => {
    if (!current) return;
    if (current.title || current.bullets.length > 0 || current.lines.length > 0) {
      sections.push(current);
    }
    current = null;
  };

  for (const line of rawLines) {
    if (isBulletLine(line)) {
      if (!current) {
        current = { title: "Details", bullets: [], lines: [] };
      }
      current.bullets.push(stripBullet(line));
      continue;
    }

    if (isSectionHeader(line)) {
      pushCurrent();
      current = { title: line.replace(/:$/, ""), bullets: [], lines: [] };
      continue;
    }

    if (current && current.bullets.length > 0 && !line.includes(":")) {
      pushCurrent();
      current = { title: line, bullets: [], lines: [] };
      continue;
    }

    if (!current) {
      current = { title: line, bullets: [], lines: [] };
      continue;
    }

    current.lines.push(line);
  }

  pushCurrent();
  return sections;
}
