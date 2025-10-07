import { access, constants, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const ensureDirectory = async (path: string): Promise<void> => {
  await mkdir(path, { recursive: true });
};

export const ensureParentDirectory = async (path: string): Promise<void> => {
  const parent = dirname(path);
  if (parent && parent !== "." && parent !== path) {
    await ensureDirectory(parent);
  }
};
