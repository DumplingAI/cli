import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

import { printError, printStatus } from '../utils/output.js';

import { SKILLS, SkillAsset } from '../generated/skills.js';

interface AgentEnvironment {
  name: string;
  skillDir: string;
  detected: boolean;
}

function detectEnvironments(cwd: string): AgentEnvironment[] {
  const claudeDir = path.join(cwd, '.claude');
  const cursorDir = path.join(cwd, '.cursor');
  const codexDir = path.join(cwd, '.codex');
  const agentsDir = path.join(cwd, '.agents');

  return [
    {
      name: 'Claude Code',
      skillDir: path.join(claudeDir, 'skills', 'dumplingai-cli'),
      detected: fs.existsSync(claudeDir),
    },
    {
      name: 'Cursor',
      skillDir: path.join(cursorDir, 'skills', 'dumplingai-cli'),
      detected: fs.existsSync(cursorDir),
    },
    {
      name: 'Codex',
      skillDir: path.join(codexDir, 'skills', 'dumplingai-cli'),
      detected: fs.existsSync(codexDir),
    },
    {
      name: 'Agents',
      skillDir: path.join(agentsDir, 'skills', 'dumplingai-cli'),
      detected: fs.existsSync(agentsDir),
    },
  ];
}

function writeSkillAsset(baseDir: string, skill: SkillAsset): void {
  const skillDir = path.join(baseDir, skill.slug);
  for (const [relativeFile, content] of Object.entries(skill.files)) {
    const outputPath = path.join(skillDir, relativeFile);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content as string, 'utf8');
  }
}

function writeBundledSkills(baseDir: string): void {
  for (const skill of SKILLS) {
    writeSkillAsset(baseDir, skill);
  }
}

export function makeSetupSkillCommand(): Command {
  const skillCmd = new Command('setup')
    .description('Manage agent skill integrations');

  skillCmd.addCommand(
    new Command('skill')
      .alias('install')
      .description('Install DumplingAI skills into detected agent environments')
      .option('--all', 'Install into all supported environments, detected or not')
      .option('--dir <path>', 'Custom skill directory to install into')
      .action(async (opts: { all?: boolean; dir?: string }) => {
        const cwd = process.cwd();

        if (opts.dir) {
          writeBundledSkills(opts.dir);
          printStatus(`Installed ${SKILLS.length} bundled skills at: ${opts.dir}`);
          return;
        }

        const envs = detectEnvironments(cwd);
        const targets = opts.all ? envs : envs.filter((env) => env.detected);

        if (targets.length === 0) {
          printStatus('No agent environments detected (.claude, .cursor, .codex, .agents).');
          printStatus('Use --all to install anyway, or --dir <path> for a custom location.');
          return;
        }

        let installed = 0;
        for (const env of targets) {
          try {
            writeBundledSkills(path.dirname(env.skillDir));
            printStatus(`Installed ${SKILLS.length} bundled skills for ${env.name} at: ${path.dirname(env.skillDir)}`);
            installed++;
          } catch (err) {
            printError(`Failed to install for ${env.name}: ${(err as Error).message}`);
          }
        }

        printStatus(`\nSkill installation complete. ${installed}/${targets.length} environments configured.`);
      }),
  );

  return skillCmd;
}
