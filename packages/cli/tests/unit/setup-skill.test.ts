import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

vi.mock('../../src/generated/skills.js', () => ({
  SKILLS: [
    {
      slug: 'dumplingai-cli',
      files: {
        'SKILL.md': '# Test skill',
      },
    },
  ],
}));

describe('setup skill', () => {
  let tmpDir: string;
  let makeSetupSkillCommand: typeof import('../../src/commands/setup-skill.js').makeSetupSkillCommand;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumplingai-setup-skill-'));
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    ({ makeSetupSkillCommand } = await import('../../src/commands/setup-skill.js'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('installs bundled skills into the .agents skills directory when detected', async () => {
    fs.mkdirSync(path.join(tmpDir, '.agents'), { recursive: true });

    const previousCwd = process.cwd();
    process.chdir(tmpDir);

    try {
      await makeSetupSkillCommand().parseAsync(['skill'], { from: 'user' });
    } finally {
      process.chdir(previousCwd);
    }

    const installedSkill = path.join(tmpDir, '.agents', 'skills', 'dumplingai-cli', 'SKILL.md');
    expect(fs.existsSync(installedSkill)).toBe(true);
  });

  it('includes .agents in the no-environment hint', async () => {
    const stderrWrite = vi.spyOn(process.stderr, 'write');
    const previousCwd = process.cwd();
    process.chdir(tmpDir);

    try {
      await makeSetupSkillCommand().parseAsync(['skill'], { from: 'user' });
    } finally {
      process.chdir(previousCwd);
    }

    expect(stderrWrite).toHaveBeenCalledWith(
      expect.stringContaining('No agent environments detected (.claude, .cursor, .codex, .agents).'),
    );
  });
});
