import { existsSync } from "fs";
import process from "process";
import { setYogaLibPath, resolveYogaLib } from "./zig.ts";

// Dynamic import with path resolution for platform-specific packages
const module = await import(
  `@yoga/yoga-${process.platform}-${process.arch}/index.ts`
);
const targetLibPath = module.default;

if (!existsSync(targetLibPath)) {
  throw new Error(
    `@yoga/yoga is not supported on the current platform: ${process.platform}-${process.arch}`
  );
}

// Set the library path and get the library instance
setYogaLibPath(targetLibPath);
export const yoga = resolveYogaLib();

// Re-export all types and classes
export * from "./zig.ts";