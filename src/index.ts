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

// Re-export types and classes selectively to avoid conflicts
export {
  setYogaLibPath,
  resolveYogaLib,
  type YogaNode,
  type YogaConfig,
  type YogaLibrary,
  // Export zig types with different names to avoid conflicts
  type MeasureFunction as ZigMeasureFunction,
  type BaselineFunction as ZigBaselineFunction,
  type DirtiedFunction as ZigDirtiedFunction,
} from "./zig.ts";

export {
  // Yoga-layout compatible exports
  Align,
  BoxSizing,
  Dimension,
  Direction,
  Display,
  Edge,
  Errata,
  ExperimentalFeature,
  FlexDirection,
  Gutter,
  Justify,
  LogLevel,
  MeasureMode,
  NodeType,
  Overflow,
  PositionType,
  Unit,
  Wrap,
  Config,
  Node,
  Yoga,
  // Yoga-layout compatible types
  type Value,
  type Layout,
  type Size,
  type DirtiedFunction,
  type MeasureFunction,
  type BaselineMeasureFunction,
} from "./compat.ts";

// Default export is the yoga-layout compatible API
export { default } from "./compat.ts";
