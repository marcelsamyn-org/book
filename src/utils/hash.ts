import { createHash } from "node:crypto";

export const sha256 = (content: string): string => {
  const hash = createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
};
