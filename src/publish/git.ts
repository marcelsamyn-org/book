import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

interface CommitMetadata {
  hash: string;
  date: Date;
  message: string;
}

interface LineChanges {
  additions: number;
  deletions: number;
}

const validateGitRepo = (path: string): void => {
  const gitDir = path.replace(/\/[^/]*$/, "/.git");
  if (!existsSync(gitDir)) {
    throw new Error(`Not a git repository or .git not found at ${gitDir}`);
  }
};

export const getLastCommitMetadata = (
  filePath: string,
): {
  hash: string;
  date: Date;
  lineChanges: LineChanges;
} => {
  validateGitRepo(filePath);

  const hash = execSync(`git log -1 --format="%H" -- "${filePath}"`, {
    encoding: "utf-8",
    cwd: process.cwd(),
  }).trim();

  const timestamp = execSync(`git log -1 --format="%ct" -- "${filePath}"`, {
    encoding: "utf-8",
    cwd: process.cwd(),
  }).trim();

  const lineStats = execSync(`git diff --stat HEAD~1 HEAD -- "${filePath}"`, {
    encoding: "utf-8",
    cwd: process.cwd(),
  }).trim();

  const lineChanges = parseLineStats(lineStats);

  return {
    hash,
    date: new Date(parseInt(timestamp, 10) * 1000),
    lineChanges,
  };
};

export const getRecentCommits = (
  filePath: string,
  limit: number = 10,
): Array<{ date: Date; message: string; hash: string }> => {
  validateGitRepo(filePath);

  const output = execSync(
    `git log -${limit} --format="%H|%ct|%s" -- "${filePath}"`,
    {
      encoding: "utf-8",
      cwd: process.cwd(),
    },
  ).trim();

  return output
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const [hash, timestamp, message] = line.split("|");
      return {
        hash: hash!.trim(),
        date: new Date(parseInt(timestamp!, 10) * 1000),
        message: message!.trim(),
      };
    });
};

const parseLineStats = (stats: string): LineChanges => {
  if (!stats) {
    return { additions: 0, deletions: 0 };
  }

  const additionsMatch = stats.match(/(\d+)\s+insertion/);
  const deletionsMatch = stats.match(/(\d+)\s+deletion/);

  return {
    additions: additionsMatch ? parseInt(additionsMatch[1]!, 10) : 0,
    deletions: deletionsMatch ? parseInt(deletionsMatch[1]!, 10) : 0,
  };
};

export const formatLineChanges = (lineChanges: LineChanges): string => {
  const { additions, deletions } = lineChanges;
  if (additions > 0 && deletions > 0) {
    return `+${additions} -${deletions}`;
  }
  if (additions > 0) {
    return `+${additions}`;
  }
  if (deletions > 0) {
    return `-${deletions}`;
  }
  return "";
};
