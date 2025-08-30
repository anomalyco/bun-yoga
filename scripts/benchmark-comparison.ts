#!/usr/bin/env bun-22247
/**
 * Standalone benchmark comparison runner
 * Usage: bun-22247 run scripts/benchmark-comparison.ts [iterations]
 * Default: 10000 iterations per benchmark
 *
 * Compares three Yoga implementations:
 * - Local yoga-ffi (Zig-based FFI)
 * - Official yoga-layout (WASM-based)
 * - Bun.Yoga (Built-in to Bun runtime)
 */

// Type declarations for Bun.Yoga (not yet in official types)
declare global {
  namespace Bun {
    interface YogaNode {
      create(): YogaNode;
      free(): void;
      freeRecursive(): void;
      calculateLayout(width?: number, height?: number): void;
      getComputedLayout(): any;
      setWidth(width: number | string): void;
      setHeight(height: number | string): void;
      setMinWidth(minWidth: number): void;
      setMinHeight(minHeight: number): void;
      setMaxWidth(maxWidth: number): void;
      setMaxHeight(maxHeight: number): void;
      setPadding(edge: number, padding: number): void;
      setMargin(edge: number, margin: number): void;
      setBorder(edge: number, border: number): void;
      setPosition(edge: number, position: number): void;
      setFlexDirection(flexDirection: number): void;
      setFlexWrap(flexWrap: number): void;
      setJustifyContent(justifyContent: number): void;
      setAlignItems(alignItems: number): void;
      setAlignContent(alignContent: number): void;
      setAlignSelf(alignSelf: number): void;
      setFlexGrow(flexGrow: number): void;
      setFlexShrink(flexShrink: number): void;
      setFlexBasis(flexBasis: string | number): void;
      setAspectRatio(aspectRatio: number): void;
      setOverflow(overflow: number): void;
      setDisplay(display: number): void;
      setPositionType(positionType: number): void;
      insertChild(child: YogaNode, index: number): void;
    }

    interface YogaConfig {
      create(): YogaConfig;
      free(): void;
    }

    interface YogaStatic {
      Node: YogaNode;
      Config: YogaConfig;

      // Constants
      EDGE_LEFT: number;
      EDGE_TOP: number;
      EDGE_RIGHT: number;
      EDGE_BOTTOM: number;
      EDGE_START: number;
      EDGE_END: number;
      EDGE_HORIZONTAL: number;
      EDGE_VERTICAL: number;
      EDGE_ALL: number;

      FLEX_DIRECTION_COLUMN: number;
      FLEX_DIRECTION_COLUMN_REVERSE: number;
      FLEX_DIRECTION_ROW: number;
      FLEX_DIRECTION_ROW_REVERSE: number;

      JUSTIFY_FLEX_START: number;
      JUSTIFY_CENTER: number;
      JUSTIFY_FLEX_END: number;
      JUSTIFY_SPACE_BETWEEN: number;
      JUSTIFY_SPACE_AROUND: number;
      JUSTIFY_SPACE_EVENLY: number;

      ALIGN_AUTO: number;
      ALIGN_FLEX_START: number;
      ALIGN_CENTER: number;
      ALIGN_FLEX_END: number;
      ALIGN_STRETCH: number;
      ALIGN_BASELINE: number;
      ALIGN_SPACE_BETWEEN: number;
      ALIGN_SPACE_AROUND: number;
      ALIGN_SPACE_EVENLY: number;

      WRAP_NO_WRAP: number;
      WRAP_WRAP: number;
      WRAP_WRAP_REVERSE: number;

      OVERFLOW_VISIBLE: number;
      OVERFLOW_HIDDEN: number;
      OVERFLOW_SCROLL: number;

      DISPLAY_FLEX: number;
      DISPLAY_NONE: number;

      POSITION_TYPE_STATIC: number;
      POSITION_TYPE_RELATIVE: number;
      POSITION_TYPE_ABSOLUTE: number;
    }

    const Yoga: YogaStatic;
  }
}

// Import local yoga-ffi module
import LocalYoga, {
  Node as LocalNode,
  Config as LocalConfig,
} from "../src/index.ts";

// Import official yoga-layout package
import OfficialYoga from "yoga-layout";

interface BenchmarkResult {
  times: number[];
  total: number;
  avg: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
}

interface BenchmarkComparison {
  local: BenchmarkResult;
  official: BenchmarkResult;
  bun: BenchmarkResult;
  localVsOfficial: number;
  localVsBun: number;
  officialVsBun: number;
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

class PerformanceStats {
  private times: number[] = [];

  addTime(time: number): void {
    this.times.push(time);
  }

  getStats(): BenchmarkResult {
    const sorted = [...this.times].sort((a, b) => a - b);
    const total = this.times.reduce((sum, time) => sum + time, 0);
    const avg = total / this.times.length;

    return {
      times: [...this.times],
      total,
      avg,
      median: this.getPercentile(sorted, 50),
      p95: this.getPercentile(sorted, 95),
      p99: this.getPercentile(sorted, 99),
      min: Math.min(...this.times),
      max: Math.max(...this.times),
    };
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)] ?? 0;
  }

  reset(): void {
    this.times = [];
  }
}

class BenchmarkRunner {
  private readonly iterations: number;

  constructor(iterations = 10000) {
    this.iterations = iterations;
  }

  async runBenchmark(
    name: string,
    localScenario: () => void,
    officialScenario: () => void,
    bunScenario: () => void
  ): Promise<BenchmarkComparison> {
    console.log(
      `\n${colors.cyan}Running benchmark: ${colors.bright}${name}${colors.reset}`
    );
    console.log(`${colors.gray}Iterations: ${this.iterations}${colors.reset}`);

    // Warm up
    console.log(`${colors.yellow}Warming up...${colors.reset}`);
    for (let i = 0; i < 10; i++) {
      try {
        localScenario();
      } catch (e) {
        console.warn("Local warmup failed:", e);
      }
      try {
        officialScenario();
      } catch (e) {
        console.warn("Official warmup failed:", e);
      }
      try {
        bunScenario();
      } catch (e) {
        console.warn("Bun warmup failed:", e);
      }
    }

    const localStats = new PerformanceStats();
    const officialStats = new PerformanceStats();
    const bunStats = new PerformanceStats();

    // Benchmark local implementation
    console.log(`${colors.blue}Benchmarking local yoga-ffi...${colors.reset}`);
    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      try {
        localScenario();
      } catch (e) {
        console.warn(`Local iteration ${i} failed:`, e);
        continue;
      }
      const end = performance.now();
      localStats.addTime(end - start);
    }

    // Benchmark official implementation
    console.log(
      `${colors.magenta}Benchmarking official yoga-layout...${colors.reset}`
    );
    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      try {
        officialScenario();
      } catch (e) {
        console.warn(`Official iteration ${i} failed:`, e);
        continue;
      }
      const end = performance.now();
      officialStats.addTime(end - start);
    }

    // Benchmark Bun.Yoga implementation
    console.log(`${colors.green}Benchmarking Bun.Yoga...${colors.reset}`);
    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      try {
        bunScenario();
      } catch (e) {
        console.warn(`Bun iteration ${i} failed:`, e);
        continue;
      }
      const end = performance.now();
      bunStats.addTime(end - start);
    }

    const localResult = localStats.getStats();
    const officialResult = officialStats.getStats();
    const bunResult = bunStats.getStats();

    return {
      local: localResult,
      official: officialResult,
      bun: bunResult,
      localVsOfficial: officialResult.avg / localResult.avg,
      localVsBun: bunResult.avg / localResult.avg,
      officialVsBun: bunResult.avg / officialResult.avg,
    };
  }

  printResults(name: string, results: BenchmarkComparison): void {
    console.log(`\n${colors.bright}Results for ${name}:${colors.reset}`);
    console.log(`${colors.gray}${"=".repeat(80)}${colors.reset}`);

    // Determine best performer for coloring
    const fastest = Math.min(
      results.local.avg,
      results.official.avg,
      results.bun.avg
    );
    const localColor =
      results.local.avg === fastest ? colors.green : colors.red;
    const officialColor =
      results.official.avg === fastest ? colors.green : colors.red;
    const bunColor = results.bun.avg === fastest ? colors.green : colors.red;

    console.log(
      `${colors.cyan}Metric${colors.reset}          ${localColor}Local (ms)${colors.reset}    ${officialColor}Official (ms)${colors.reset}  ${bunColor}Bun.Yoga (ms)${colors.reset}`
    );
    console.log(`${colors.gray}${"-".repeat(70)}${colors.reset}`);

    const printMetric = (
      label: string,
      local: number,
      official: number,
      bun: number
    ) => {
      console.log(
        `${label.padEnd(15)} ${localColor}${this.formatNumber(local)}${
          colors.reset
        }    ${officialColor}${this.formatNumber(official)}${
          colors.reset
        }    ${bunColor}${this.formatNumber(bun)}${colors.reset}`
      );
    };

    printMetric(
      "Total",
      results.local.total,
      results.official.total,
      results.bun.total
    );
    printMetric(
      "Average",
      results.local.avg,
      results.official.avg,
      results.bun.avg
    );
    printMetric(
      "Median",
      results.local.median,
      results.official.median,
      results.bun.median
    );
    printMetric(
      "P95",
      results.local.p95,
      results.official.p95,
      results.bun.p95
    );
    printMetric(
      "P99",
      results.local.p99,
      results.official.p99,
      results.bun.p99
    );
    printMetric(
      "Min",
      results.local.min,
      results.official.min,
      results.bun.min
    );
    printMetric(
      "Max",
      results.local.max,
      results.official.max,
      results.bun.max
    );

    // Show performance comparisons relative to the winner
    console.log(
      `\n${colors.bright}Performance Comparison (relative to winner):${colors.reset}`
    );
    console.log(`${colors.gray}${"-".repeat(50)}${colors.reset}`);
    
    const winner = results.local.avg === fastest ? "Local" : 
                  results.official.avg === fastest ? "Official" : "Bun.Yoga";
    
    if (winner === "Local") {
      console.log(`${colors.green}Local (winner):     1.00x${colors.reset}`);
      console.log(`${colors.red}Official:           ${this.formatSpeedup(results.official.avg / results.local.avg)}${colors.reset}`);
      console.log(`${colors.red}Bun.Yoga:           ${this.formatSpeedup(results.bun.avg / results.local.avg)}${colors.reset}`);
    } else if (winner === "Official") {
      console.log(`${colors.red}Local:              ${this.formatSpeedup(results.local.avg / results.official.avg)}${colors.reset}`);
      console.log(`${colors.green}Official (winner):  1.00x${colors.reset}`);
      console.log(`${colors.red}Bun.Yoga:           ${this.formatSpeedup(results.bun.avg / results.official.avg)}${colors.reset}`);
    } else {
      console.log(`${colors.red}Local:              ${this.formatSpeedup(results.local.avg / results.bun.avg)}${colors.reset}`);
      console.log(`${colors.red}Official:           ${this.formatSpeedup(results.official.avg / results.bun.avg)}${colors.reset}`);
      console.log(`${colors.green}Bun.Yoga (winner):  1.00x${colors.reset}`);
    }

    const winnerColor =
      results.local.avg === fastest
        ? colors.green
        : results.official.avg === fastest
        ? colors.red
        : colors.blue;

    console.log(
      `\n${winnerColor}🏆 Winner: ${winner} implementation${colors.reset}`
    );
  }

  private getSpeedupColor(speedup: number): string {
    return speedup > 1 ? colors.green : colors.red;
  }

  private formatNumber(num: number): string {
    return num.toFixed(3).padStart(10);
  }

  private formatSpeedup(speedup: number): string {
    return `${speedup.toFixed(2)}x`.padStart(8);
  }

  printSummary(results: { [key: string]: BenchmarkComparison }): void {
    console.log(`\n${colors.bright}BENCHMARK SUMMARY${colors.reset}`);
    console.log(`${colors.gray}${"=".repeat(90)}${colors.reset}`);

    let totalLocalWins = 0;
    let totalOfficialWins = 0;
    let totalBunWins = 0;
    let avgLocalVsOfficial = 0;
    let avgLocalVsBun = 0;
    let avgOfficialVsBun = 0;

    console.log(
      `\n${colors.cyan}Benchmark${colors.reset}                     ${colors.yellow}Winner${colors.reset}        ${colors.magenta}Best Time (ms)${colors.reset}`
    );
    console.log(`${colors.gray}${"-".repeat(70)}${colors.reset}`);

    Object.entries(results).forEach(([name, result]) => {
      const fastest = Math.min(
        result.local.avg,
        result.official.avg,
        result.bun.avg
      );
      const winner =
        result.local.avg === fastest
          ? "Local"
          : result.official.avg === fastest
          ? "Official"
          : "Bun.Yoga";
      const winnerColor =
        result.local.avg === fastest
          ? colors.green
          : result.official.avg === fastest
          ? colors.red
          : colors.blue;

      if (result.local.avg === fastest) {
        totalLocalWins++;
      } else if (result.official.avg === fastest) {
        totalOfficialWins++;
      } else {
        totalBunWins++;
      }

      avgLocalVsOfficial += result.localVsOfficial;
      avgLocalVsBun += result.localVsBun;
      avgOfficialVsBun += result.officialVsBun;

      console.log(
        `${name.padEnd(29)} ${winnerColor}${winner.padEnd(13)}${
          colors.reset
        } ${this.formatNumber(fastest)}`
      );
    });

    const numBenchmarks = Object.keys(results).length;
    avgLocalVsOfficial /= numBenchmarks;
    avgLocalVsBun /= numBenchmarks;
    avgOfficialVsBun /= numBenchmarks;

    console.log(`\n${colors.bright}Overall Statistics:${colors.reset}`);
    console.log(
      `  Local wins: ${colors.green}${totalLocalWins}${colors.reset}`
    );
    console.log(
      `  Official wins: ${colors.red}${totalOfficialWins}${colors.reset}`
    );
    console.log(
      `  Bun.Yoga wins: ${colors.blue}${totalBunWins}${colors.reset}`
    );

    console.log(`\n${colors.bright}Performance Summary:${colors.reset}`);
    
    // Determine the overall best performer based on wins
    const overallBest = totalLocalWins > totalOfficialWins && totalLocalWins > totalBunWins ? "Local" :
                       totalOfficialWins > totalBunWins ? "Official" : "Bun.Yoga";
    
    console.log(`\n${colors.bright}Average Performance (relative to best):${colors.reset}`);
    
    if (overallBest === "Local") {
      console.log(`  ${colors.green}Local (best):       1.00x${colors.reset}`);
      console.log(`  ${colors.red}Official:           ${this.formatSpeedup(avgLocalVsOfficial > 1 ? avgLocalVsOfficial : 1/avgLocalVsOfficial)}${colors.reset}`);
      console.log(`  ${colors.red}Bun.Yoga:           ${this.formatSpeedup(avgLocalVsBun > 1 ? avgLocalVsBun : 1/avgLocalVsBun)}${colors.reset}`);
    } else if (overallBest === "Official") {
      console.log(`  ${colors.red}Local:              ${this.formatSpeedup(avgLocalVsOfficial < 1 ? 1/avgLocalVsOfficial : avgLocalVsOfficial)}${colors.reset}`);
      console.log(`  ${colors.green}Official (best):    1.00x${colors.reset}`);
      console.log(`  ${colors.red}Bun.Yoga:           ${this.formatSpeedup(avgOfficialVsBun > 1 ? avgOfficialVsBun : 1/avgOfficialVsBun)}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}Local:              ${this.formatSpeedup(avgLocalVsBun < 1 ? 1/avgLocalVsBun : avgLocalVsBun)}${colors.reset}`);
      console.log(`  ${colors.red}Official:           ${this.formatSpeedup(avgOfficialVsBun < 1 ? 1/avgOfficialVsBun : avgOfficialVsBun)}${colors.reset}`);
      console.log(`  ${colors.green}Bun.Yoga (best):    1.00x${colors.reset}`);
    }

    const overallWinnerColor =
      overallBest === "Local"
        ? colors.green
        : overallBest === "Official"
        ? colors.red
        : colors.blue;

    const overallWinnerName = 
      overallBest === "Local" ? "Local yoga-ffi" :
      overallBest === "Official" ? "Official yoga-layout" : "Bun.Yoga";

    console.log(
      `\n${overallWinnerColor}🏆 Overall winner: ${overallWinnerName} (${Math.max(
        totalLocalWins,
        totalOfficialWins,
        totalBunWins
      )} wins)${colors.reset}`
    );
  }
}

// Benchmark scenarios
class BenchmarkScenarios {
  private runner: BenchmarkRunner;
  private results: { [key: string]: BenchmarkComparison } = {};

  constructor(iterations = 10000) {
    this.runner = new BenchmarkRunner(iterations);
  }

  async runAllBenchmarks(): Promise<void> {
    console.log(
      `${colors.bright}Starting comprehensive yoga-ffi vs yoga-layout benchmark${colors.reset}`
    );
    console.log(`${colors.gray}${"=".repeat(80)}${colors.reset}`);

    this.results["Simple Layout"] = await this.simpleLayoutBenchmark();
    this.results["Layout Changes"] = await this.layoutChangesBenchmark();
    this.results["Dynamic Complexity"] =
      await this.dynamicComplexityBenchmark();
    this.results["Deep Nested Layout"] = await this.nestedLayoutBenchmark();
    this.results["Complex Flex Layout"] = await this.flexLayoutBenchmark();

    // Skip advanced features test for now due to segmentation fault
    // this.results["Advanced Features Stress Test"] =
    //   await this.advancedFeaturesStressTestBenchmark();

    this.runner.printSummary(this.results);
    console.log(`\n${colors.green}All benchmarks completed${colors.reset}`);
  }

  private async simpleLayoutBenchmark(): Promise<BenchmarkComparison> {
    const results = await this.runner.runBenchmark(
      "Simple Layout Creation and Calculation",
      () => {
        // Local implementation
        const config = new LocalConfig();
        const root = new LocalNode(config);

        root.setWidth(100);
        root.setHeight(200);
        root.setPadding(LocalYoga.EDGE_ALL, 10);
        root.setMargin(LocalYoga.EDGE_ALL, 5);

        root.calculateLayout(undefined, undefined);

        // Get computed layout to ensure calculation happened
        const layout = root.getComputedLayout();

        root.free();
        config.free();
      },
      () => {
        // Official implementation
        const root = OfficialYoga.Node.create();

        root.setWidth(100);
        root.setHeight(200);
        root.setPadding(OfficialYoga.EDGE_ALL, 10);
        root.setMargin(OfficialYoga.EDGE_ALL, 5);

        root.calculateLayout(undefined, undefined);

        // Get computed layout to ensure calculation happened
        const layout = root.getComputedLayout();

        root.free();
      },
      () => {
        // Bun.Yoga implementation
        const root = Bun.Yoga.Node.create();

        root.setWidth(100);
        root.setHeight(200);
        root.setPadding(Bun.Yoga.EDGE_ALL, 10);
        root.setMargin(Bun.Yoga.EDGE_ALL, 5);

        root.calculateLayout(undefined, undefined);

        // Get computed layout to ensure calculation happened
        const layout = root.getComputedLayout();

        root.free();
      }
    );

    this.runner.printResults("Simple Layout", results);
    return results;
  }

  private async layoutChangesBenchmark(): Promise<BenchmarkComparison> {
    const results = await this.runner.runBenchmark(
      "Layout Changes and Recalculation",
      () => {
        // Local implementation
        const config = new LocalConfig();
        const root = new LocalNode(config);

        // Initial layout
        root.setWidth(100);
        root.setHeight(100);
        root.calculateLayout(undefined, undefined);

        // Change 1: Resize
        root.setWidth(150);
        root.setHeight(150);
        root.calculateLayout(undefined, undefined);

        // Change 2: Add padding
        root.setPadding(LocalYoga.EDGE_ALL, 20);
        root.calculateLayout(undefined, undefined);

        // Change 3: Change flex properties
        root.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
        root.setJustifyContent(LocalYoga.JUSTIFY_CENTER);
        root.calculateLayout(undefined, undefined);

        root.free();
        config.free();
      },
      () => {
        // Official implementation
        const root = OfficialYoga.Node.create();

        // Initial layout
        root.setWidth(100);
        root.setHeight(100);
        root.calculateLayout(undefined, undefined);

        // Change 1: Resize
        root.setWidth(150);
        root.setHeight(150);
        root.calculateLayout(undefined, undefined);

        // Change 2: Add padding
        root.setPadding(OfficialYoga.EDGE_ALL, 20);
        root.calculateLayout(undefined, undefined);

        // Change 3: Change flex properties
        root.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
        root.setJustifyContent(OfficialYoga.JUSTIFY_CENTER);
        root.calculateLayout(undefined, undefined);

        root.free();
      },
      () => {
        // Bun.Yoga implementation
        const root = Bun.Yoga.Node.create();

        // Initial layout
        root.setWidth(100);
        root.setHeight(100);
        root.calculateLayout(undefined, undefined);

        // Change 1: Resize
        root.setWidth(150);
        root.setHeight(150);
        root.calculateLayout(undefined, undefined);

        // Change 2: Add padding
        root.setPadding(Bun.Yoga.EDGE_ALL, 20);
        root.calculateLayout(undefined, undefined);

        // Change 3: Change flex properties
        root.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);
        root.setJustifyContent(Bun.Yoga.JUSTIFY_CENTER);
        root.calculateLayout(undefined, undefined);

        root.free();
      }
    );

    this.runner.printResults("Layout Changes", results);
    return results;
  }

  private async dynamicComplexityBenchmark(): Promise<BenchmarkComparison> {
    const results = await this.runner.runBenchmark(
      "Dynamic Complexity - Progressive Child Addition",
      () => {
        // Local implementation
        const config = new LocalConfig();
        const root = new LocalNode(config);
        root.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
        root.setWidth(300);
        root.setHeight(400);

        const children: LocalNode[] = [];

        // Stage 1: Add 5 children
        for (let i = 0; i < 5; i++) {
          const child = new LocalNode(config);
          child.setFlexGrow(1);
          child.setMargin(LocalYoga.EDGE_ALL, 2);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout(undefined, undefined);

        // Stage 2: Add 10 more children (15 total)
        for (let i = 5; i < 15; i++) {
          const child = new LocalNode(config);
          child.setFlexGrow(1);
          child.setMargin(LocalYoga.EDGE_ALL, 2);
          child.setPadding(LocalYoga.EDGE_ALL, 5);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout(undefined, undefined);

        // Stage 3: Add nested children to some nodes
        for (let i = 0; i < 5; i++) {
          const parent = children[i];
          if (parent) {
            parent.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);

            for (let j = 0; j < 3; j++) {
              const grandchild = new LocalNode(config);
              grandchild.setFlexGrow(1);
              grandchild.setWidth(20);
              grandchild.setHeight(20);
              parent.insertChild(grandchild, j);
            }
          }
        }
        root.calculateLayout(undefined, undefined);

        root.freeRecursive();
        config.free();
      },
      () => {
        // Official implementation
        const root = OfficialYoga.Node.create();
        root.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);
        root.setWidth(300);
        root.setHeight(400);

        const children: any[] = [];

        // Stage 1: Add 5 children
        for (let i = 0; i < 5; i++) {
          const child = OfficialYoga.Node.create();
          child.setFlexGrow(1);
          child.setMargin(OfficialYoga.EDGE_ALL, 2);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout(undefined, undefined);

        // Stage 2: Add 10 more children (15 total)
        for (let i = 5; i < 15; i++) {
          const child = OfficialYoga.Node.create();
          child.setFlexGrow(1);
          child.setMargin(OfficialYoga.EDGE_ALL, 2);
          child.setPadding(OfficialYoga.EDGE_ALL, 5);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout(undefined, undefined);

        // Stage 3: Add nested children to some nodes
        for (let i = 0; i < 5; i++) {
          const parent = children[i];
          parent.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);

          for (let j = 0; j < 3; j++) {
            const grandchild = OfficialYoga.Node.create();
            grandchild.setFlexGrow(1);
            grandchild.setWidth(20);
            grandchild.setHeight(20);
            parent.insertChild(grandchild, j);
          }
        }
        root.calculateLayout(undefined, undefined);

        root.freeRecursive();
      },
      () => {
        // Bun.Yoga implementation
        const root = Bun.Yoga.Node.create();
        root.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);
        root.setWidth(300);
        root.setHeight(400);

        const children: any[] = [];

        // Stage 1: Add 5 children
        for (let i = 0; i < 5; i++) {
          const child = Bun.Yoga.Node.create();
          child.setFlexGrow(1);
          child.setMargin(Bun.Yoga.EDGE_ALL, 2);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout(undefined, undefined);

        // Stage 2: Add 10 more children (15 total)
        for (let i = 5; i < 15; i++) {
          const child = Bun.Yoga.Node.create();
          child.setFlexGrow(1);
          child.setMargin(Bun.Yoga.EDGE_ALL, 2);
          child.setPadding(Bun.Yoga.EDGE_ALL, 5);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout(undefined, undefined);

        // Stage 3: Add nested children to some nodes
        for (let i = 0; i < 5; i++) {
          const parent = children[i];
          parent.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);

          for (let j = 0; j < 3; j++) {
            const grandchild = Bun.Yoga.Node.create();
            grandchild.setFlexGrow(1);
            grandchild.setWidth(20);
            grandchild.setHeight(20);
            parent.insertChild(grandchild, j);
          }
        }
        root.calculateLayout(undefined, undefined);

        root.freeRecursive();
      }
    );

    this.runner.printResults("Dynamic Complexity", results);
    return results;
  }

  private async nestedLayoutBenchmark(): Promise<BenchmarkComparison> {
    const results = await this.runner.runBenchmark(
      "Deep Nested Layout",
      () => {
        // Local implementation
        const config = new LocalConfig();
        const root = new LocalNode(config);
        root.setWidth(400);
        root.setHeight(400);
        root.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);

        // Create 3 levels of nesting with multiple children at each level
        for (let i = 0; i < 3; i++) {
          const level1 = new LocalNode(config);
          level1.setFlexGrow(1);
          level1.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
          level1.setPadding(LocalYoga.EDGE_ALL, 5);
          root.insertChild(level1, i);

          for (let j = 0; j < 4; j++) {
            const level2 = new LocalNode(config);
            level2.setFlexGrow(1);
            level2.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
            level2.setMargin(LocalYoga.EDGE_ALL, 3);
            level1.insertChild(level2, j);

            for (let k = 0; k < 3; k++) {
              const level3 = new LocalNode(config);
              level3.setFlexGrow(1);
              level3.setMinWidth(10);
              level3.setMinHeight(10);
              level2.insertChild(level3, k);
            }
          }
        }

        root.calculateLayout(undefined, undefined);
        root.freeRecursive();
        config.free();
      },
      () => {
        // Official implementation
        const root = OfficialYoga.Node.create();
        root.setWidth(400);
        root.setHeight(400);
        root.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);

        // Create 3 levels of nesting with multiple children at each level
        for (let i = 0; i < 3; i++) {
          const level1 = OfficialYoga.Node.create();
          level1.setFlexGrow(1);
          level1.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
          level1.setPadding(OfficialYoga.EDGE_ALL, 5);
          root.insertChild(level1, i);

          for (let j = 0; j < 4; j++) {
            const level2 = OfficialYoga.Node.create();
            level2.setFlexGrow(1);
            level2.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);
            level2.setMargin(OfficialYoga.EDGE_ALL, 3);
            level1.insertChild(level2, j);

            for (let k = 0; k < 3; k++) {
              const level3 = OfficialYoga.Node.create();
              level3.setFlexGrow(1);
              level3.setMinWidth(10);
              level3.setMinHeight(10);
              level2.insertChild(level3, k);
            }
          }
        }

        root.calculateLayout(undefined, undefined);
        root.freeRecursive();
      },
      () => {
        // Bun.Yoga implementation
        const root = Bun.Yoga.Node.create();
        root.setWidth(400);
        root.setHeight(400);
        root.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);

        // Create 3 levels of nesting with multiple children at each level
        for (let i = 0; i < 3; i++) {
          const level1 = Bun.Yoga.Node.create();
          level1.setFlexGrow(1);
          level1.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);
          level1.setPadding(Bun.Yoga.EDGE_ALL, 5);
          root.insertChild(level1, i);

          for (let j = 0; j < 4; j++) {
            const level2 = Bun.Yoga.Node.create();
            level2.setFlexGrow(1);
            level2.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);
            level2.setMargin(Bun.Yoga.EDGE_ALL, 3);
            level1.insertChild(level2, j);

            for (let k = 0; k < 3; k++) {
              const level3 = Bun.Yoga.Node.create();
              level3.setFlexGrow(1);
              level3.setMinWidth(10);
              level3.setMinHeight(10);
              level2.insertChild(level3, k);
            }
          }
        }

        root.calculateLayout(undefined, undefined);
        root.freeRecursive();
      }
    );

    this.runner.printResults("Deep Nested Layout", results);
    return results;
  }

  private async flexLayoutBenchmark(): Promise<BenchmarkComparison> {
    const results = await this.runner.runBenchmark(
      "Complex Flex Layout with Wrapping",
      () => {
        // Local implementation
        const config = new LocalConfig();
        const root = new LocalNode(config);
        root.setWidth(300);
        root.setHeight(200);
        root.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
        root.setFlexWrap(LocalYoga.WRAP_WRAP);
        root.setAlignContent(LocalYoga.ALIGN_STRETCH);
        root.setJustifyContent(LocalYoga.JUSTIFY_SPACE_BETWEEN);

        // Add many flex items that will wrap
        for (let i = 0; i < 20; i++) {
          const item = new LocalNode(config);
          item.setWidth(60);
          item.setHeight(40);
          item.setFlexShrink(1);
          item.setMargin(LocalYoga.EDGE_ALL, 2);

          // Vary some properties
          if (i % 3 === 0) {
            item.setFlexGrow(1);
          }
          if (i % 5 === 0) {
            item.setAlignSelf(LocalYoga.ALIGN_CENTER);
          }

          root.insertChild(item, i);
        }

        root.calculateLayout(undefined, undefined);
        root.freeRecursive();
        config.free();
      },
      () => {
        // Official implementation
        const root = OfficialYoga.Node.create();
        root.setWidth(300);
        root.setHeight(200);
        root.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
        root.setFlexWrap(OfficialYoga.WRAP_WRAP);
        root.setAlignContent(OfficialYoga.ALIGN_STRETCH);
        root.setJustifyContent(OfficialYoga.JUSTIFY_SPACE_BETWEEN);

        // Add many flex items that will wrap
        for (let i = 0; i < 20; i++) {
          const item = OfficialYoga.Node.create();
          item.setWidth(60);
          item.setHeight(40);
          item.setFlexShrink(1);
          item.setMargin(OfficialYoga.EDGE_ALL, 2);

          // Vary some properties
          if (i % 3 === 0) {
            item.setFlexGrow(1);
          }
          if (i % 5 === 0) {
            item.setAlignSelf(OfficialYoga.ALIGN_CENTER);
          }

          root.insertChild(item, i);
        }

        root.calculateLayout(undefined, undefined);
        root.freeRecursive();
      },
      () => {
        // Bun.Yoga implementation
        const root = Bun.Yoga.Node.create();
        root.setWidth(300);
        root.setHeight(200);
        root.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);
        root.setFlexWrap(Bun.Yoga.WRAP_WRAP);
        root.setAlignContent(Bun.Yoga.ALIGN_STRETCH);
        root.setJustifyContent(Bun.Yoga.JUSTIFY_SPACE_BETWEEN);

        // Add many flex items that will wrap
        for (let i = 0; i < 20; i++) {
          const item = Bun.Yoga.Node.create();
          item.setWidth(60);
          item.setHeight(40);
          item.setFlexShrink(1);
          item.setMargin(Bun.Yoga.EDGE_ALL, 2);

          // Vary some properties
          if (i % 3 === 0) {
            item.setFlexGrow(1);
          }
          if (i % 5 === 0) {
            item.setAlignSelf(Bun.Yoga.ALIGN_CENTER);
          }

          root.insertChild(item, i);
        }

        root.calculateLayout(undefined, undefined);
        root.freeRecursive();
      }
    );

    this.runner.printResults("Complex Flex Layout", results);
    return results;
  }

  private async advancedFeaturesStressTestBenchmark(): Promise<BenchmarkComparison> {
    const results = await this.runner.runBenchmark(
      "Advanced Features Stress Test - All Layout Features Combined",
      () => {
        // Local implementation - Ultra complex scenario
        const config = new LocalConfig();
        const root = new LocalNode(config);

        // Root container setup with advanced properties
        root.setWidth(800);
        root.setHeight(600);
        root.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
        root.setJustifyContent(LocalYoga.JUSTIFY_SPACE_BETWEEN);
        root.setAlignItems(LocalYoga.ALIGN_STRETCH);
        root.setPadding(LocalYoga.EDGE_ALL, 20);
        root.setMargin(LocalYoga.EDGE_ALL, 10);
        root.setOverflow(LocalYoga.OVERFLOW_SCROLL);

        const containers: LocalNode[] = [];

        // Create 4 main containers with different layout patterns
        for (let i = 0; i < 4; i++) {
          const container = new LocalNode(config);
          container.setFlexGrow(1);
          container.setFlexShrink(0);
          container.setFlexBasis("25%");
          container.setMargin(LocalYoga.EDGE_ALL, 5);
          container.setPadding(LocalYoga.EDGE_ALL, 10);

          // Vary container properties
          if (i === 0) {
            // Horizontal scrolling container
            container.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
            container.setFlexWrap(LocalYoga.WRAP_NO_WRAP);
            container.setOverflow(LocalYoga.OVERFLOW_SCROLL);
            container.setJustifyContent(LocalYoga.JUSTIFY_FLEX_START);
          } else if (i === 1) {
            // Grid-like wrapping container
            container.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
            container.setFlexWrap(LocalYoga.WRAP_WRAP);
            container.setAlignContent(LocalYoga.ALIGN_SPACE_BETWEEN);
            container.setJustifyContent(LocalYoga.JUSTIFY_SPACE_AROUND);
          } else if (i === 2) {
            // Absolute positioned container
            container.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
            container.setPositionType(LocalYoga.POSITION_TYPE_RELATIVE);
            container.setAlignItems(LocalYoga.ALIGN_CENTER);
          } else {
            // Complex nested container
            container.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
            container.setJustifyContent(LocalYoga.JUSTIFY_SPACE_EVENLY);
            container.setAlignItems(LocalYoga.ALIGN_STRETCH);
          }

          root.insertChild(container, i);
          containers.push(container);
        }

        // Populate each container with complex children
        containers.forEach((container, containerIndex) => {
          const childCount = 8 + containerIndex * 3; // Varying child counts

          for (let j = 0; j < childCount; j++) {
            const child = new LocalNode(config);

            // Base properties for all children
            child.setPadding(LocalYoga.EDGE_ALL, 3);
            child.setMargin(LocalYoga.EDGE_ALL, 2);
            child.setBorder(LocalYoga.EDGE_ALL, 1);

            // Complex property variations based on position
            const variation = (containerIndex * childCount + j) % 12;

            switch (variation) {
              case 0: // Fixed size with aspect ratio
                child.setWidth(80);
                child.setAspectRatio(1.5);
                child.setFlexShrink(0);
                break;
              case 1: // Percentage width with min/max constraints
                child.setWidth("40%");
                child.setMinWidth(60);
                child.setMaxWidth(120);
                child.setHeight(50);
                break;
              case 2: // Flex grow with percentage height
                child.setFlexGrow(2);
                child.setHeight("15%");
                child.setMinHeight(30);
                child.setAlignSelf(LocalYoga.ALIGN_FLEX_START);
                break;
              case 3: // Absolute positioned
                child.setPositionType(LocalYoga.POSITION_TYPE_ABSOLUTE);
                child.setPosition(LocalYoga.EDGE_LEFT, 10 + j * 5);
                child.setPosition(LocalYoga.EDGE_TOP, 10 + j * 3);
                child.setWidth(40);
                child.setHeight(40);
                break;
              case 4: // Complex margin/padding variations
                child.setFlexGrow(1);
                child.setMargin(LocalYoga.EDGE_LEFT, 5);
                child.setMargin(LocalYoga.EDGE_RIGHT, 15);
                child.setPadding(LocalYoga.EDGE_TOP, 8);
                child.setPadding(LocalYoga.EDGE_BOTTOM, 12);
                child.setMinHeight(40);
                break;
              case 5: // Percentage-based with aspect ratio
                child.setWidth("30%");
                child.setAspectRatio(0.75);
                child.setFlexShrink(1);
                child.setAlignSelf(LocalYoga.ALIGN_CENTER);
                break;
              case 6: // Max constraints with flex
                child.setFlexGrow(1);
                child.setMaxWidth(100);
                child.setMaxHeight(80);
                child.setAlignSelf(LocalYoga.ALIGN_FLEX_END);
                break;
              case 7: // Hidden/Display variations
                if (j % 3 === 0) {
                  child.setDisplay(LocalYoga.DISPLAY_NONE);
                } else {
                  child.setDisplay(LocalYoga.DISPLAY_FLEX);
                  child.setFlexGrow(1);
                  child.setHeight(35);
                }
                break;
              case 8: // Complex border/padding combinations
                child.setBorder(LocalYoga.EDGE_LEFT, 3);
                child.setBorder(LocalYoga.EDGE_RIGHT, 1);
                child.setPadding(LocalYoga.EDGE_LEFT, 10);
                child.setPadding(LocalYoga.EDGE_RIGHT, 5);
                child.setWidth(70);
                child.setHeight(45);
                break;
              case 9: // Nested flex container
                child.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
                child.setFlexGrow(1);
                child.setMinHeight(60);
                child.setJustifyContent(LocalYoga.JUSTIFY_SPACE_BETWEEN);

                // Add nested children
                for (let k = 0; k < 3; k++) {
                  const nested = new LocalNode(config);
                  nested.setFlexGrow(1);
                  nested.setHeight(20);
                  nested.setMargin(LocalYoga.EDGE_ALL, 1);
                  nested.setAspectRatio(1.0);
                  child.insertChild(nested, k);
                }
                break;
              case 10: // Overflow and scrolling
                child.setOverflow(LocalYoga.OVERFLOW_SCROLL);
                child.setWidth(90);
                child.setHeight(70);
                child.setFlexShrink(0);
                break;
              case 11: // Complex positioning
                child.setPositionType(LocalYoga.POSITION_TYPE_RELATIVE);
                child.setPosition(LocalYoga.EDGE_LEFT, j * 2);
                child.setFlexGrow(1);
                child.setMinWidth(50);
                child.setMaxWidth(150);
                child.setHeight(55);
                break;
            }

            container.insertChild(child, j);
          }
        });

        // Multiple layout calculations with property changes
        root.calculateLayout(undefined, undefined);

        // Dynamic property changes during benchmark
        containers[0]?.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
        containers[1]?.setJustifyContent(LocalYoga.JUSTIFY_CENTER);
        root.calculateLayout(undefined, undefined);

        containers[2]?.setAlignItems(LocalYoga.ALIGN_FLEX_END);
        containers[3]?.setFlexWrap(LocalYoga.WRAP_WRAP_REVERSE);
        root.calculateLayout(undefined, undefined);

        // Final calculation
        root.calculateLayout(undefined, undefined);

        // Get layout to ensure calculations happened
        const layout = root.getComputedLayout();

        root.freeRecursive();
        config.free();
      },
      () => {
        // Official implementation - Same complex scenario
        const root = OfficialYoga.Node.create();

        // Root container setup with advanced properties
        root.setWidth(800);
        root.setHeight(600);
        root.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);
        root.setJustifyContent(OfficialYoga.JUSTIFY_SPACE_BETWEEN);
        root.setAlignItems(OfficialYoga.ALIGN_STRETCH);
        root.setPadding(OfficialYoga.EDGE_ALL, 20);
        root.setMargin(OfficialYoga.EDGE_ALL, 10);
        root.setOverflow(OfficialYoga.OVERFLOW_SCROLL);

        const containers: any[] = [];

        // Create 4 main containers with different layout patterns
        for (let i = 0; i < 4; i++) {
          const container = OfficialYoga.Node.create();
          container.setFlexGrow(1);
          container.setFlexShrink(0);
          container.setFlexBasis("25%");
          container.setMargin(OfficialYoga.EDGE_ALL, 5);
          container.setPadding(OfficialYoga.EDGE_ALL, 10);

          // Vary container properties
          if (i === 0) {
            // Horizontal scrolling container
            container.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
            container.setFlexWrap(OfficialYoga.WRAP_NO_WRAP);
            container.setOverflow(OfficialYoga.OVERFLOW_SCROLL);
            container.setJustifyContent(OfficialYoga.JUSTIFY_FLEX_START);
          } else if (i === 1) {
            // Grid-like wrapping container
            container.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
            container.setFlexWrap(OfficialYoga.WRAP_WRAP);
            container.setAlignContent(OfficialYoga.ALIGN_SPACE_BETWEEN);
            container.setJustifyContent(OfficialYoga.JUSTIFY_SPACE_AROUND);
          } else if (i === 2) {
            // Absolute positioned container
            container.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);
            container.setPositionType(OfficialYoga.POSITION_TYPE_RELATIVE);
            container.setAlignItems(OfficialYoga.ALIGN_CENTER);
          } else {
            // Complex nested container
            container.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);
            container.setJustifyContent(OfficialYoga.JUSTIFY_SPACE_EVENLY);
            container.setAlignItems(OfficialYoga.ALIGN_STRETCH);
          }

          root.insertChild(container, i);
          containers.push(container);
        }

        // Populate each container with complex children
        containers.forEach((container, containerIndex) => {
          const childCount = 8 + containerIndex * 3; // Varying child counts

          for (let j = 0; j < childCount; j++) {
            const child = OfficialYoga.Node.create();

            // Base properties for all children
            child.setPadding(OfficialYoga.EDGE_ALL, 3);
            child.setMargin(OfficialYoga.EDGE_ALL, 2);
            child.setBorder(OfficialYoga.EDGE_ALL, 1);

            // Complex property variations based on position
            const variation = (containerIndex * childCount + j) % 12;

            switch (variation) {
              case 0: // Fixed size with aspect ratio
                child.setWidth(80);
                child.setAspectRatio(1.5);
                child.setFlexShrink(0);
                break;
              case 1: // Percentage width with min/max constraints
                child.setWidth("40%");
                child.setMinWidth(60);
                child.setMaxWidth(120);
                child.setHeight(50);
                break;
              case 2: // Flex grow with percentage height
                child.setFlexGrow(2);
                child.setHeight("15%");
                child.setMinHeight(30);
                child.setAlignSelf(OfficialYoga.ALIGN_FLEX_START);
                break;
              case 3: // Absolute positioned
                child.setPositionType(OfficialYoga.POSITION_TYPE_ABSOLUTE);
                child.setPosition(OfficialYoga.EDGE_LEFT, 10 + j * 5);
                child.setPosition(OfficialYoga.EDGE_TOP, 10 + j * 3);
                child.setWidth(40);
                child.setHeight(40);
                break;
              case 4: // Complex margin/padding variations
                child.setFlexGrow(1);
                child.setMargin(OfficialYoga.EDGE_LEFT, 5);
                child.setMargin(OfficialYoga.EDGE_RIGHT, 15);
                child.setPadding(OfficialYoga.EDGE_TOP, 8);
                child.setPadding(OfficialYoga.EDGE_BOTTOM, 12);
                child.setMinHeight(40);
                break;
              case 5: // Percentage-based with aspect ratio
                child.setWidth("30%");
                child.setAspectRatio(0.75);
                child.setFlexShrink(1);
                child.setAlignSelf(OfficialYoga.ALIGN_CENTER);
                break;
              case 6: // Max constraints with flex
                child.setFlexGrow(1);
                child.setMaxWidth(100);
                child.setMaxHeight(80);
                child.setAlignSelf(OfficialYoga.ALIGN_FLEX_END);
                break;
              case 7: // Hidden/Display variations
                if (j % 3 === 0) {
                  child.setDisplay(OfficialYoga.DISPLAY_NONE);
                } else {
                  child.setDisplay(OfficialYoga.DISPLAY_FLEX);
                  child.setFlexGrow(1);
                  child.setHeight(35);
                }
                break;
              case 8: // Complex border/padding combinations
                child.setBorder(OfficialYoga.EDGE_LEFT, 3);
                child.setBorder(OfficialYoga.EDGE_RIGHT, 1);
                child.setPadding(OfficialYoga.EDGE_LEFT, 10);
                child.setPadding(OfficialYoga.EDGE_RIGHT, 5);
                child.setWidth(70);
                child.setHeight(45);
                break;
              case 9: // Nested flex container
                child.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
                child.setFlexGrow(1);
                child.setMinHeight(60);
                child.setJustifyContent(OfficialYoga.JUSTIFY_SPACE_BETWEEN);

                // Add nested children
                for (let k = 0; k < 3; k++) {
                  const nested = OfficialYoga.Node.create();
                  nested.setFlexGrow(1);
                  nested.setHeight(20);
                  nested.setMargin(OfficialYoga.EDGE_ALL, 1);
                  nested.setAspectRatio(1.0);
                  child.insertChild(nested, k);
                }
                break;
              case 10: // Overflow and scrolling
                child.setOverflow(OfficialYoga.OVERFLOW_SCROLL);
                child.setWidth(90);
                child.setHeight(70);
                child.setFlexShrink(0);
                break;
              case 11: // Complex positioning
                child.setPositionType(OfficialYoga.POSITION_TYPE_RELATIVE);
                child.setPosition(OfficialYoga.EDGE_LEFT, j * 2);
                child.setFlexGrow(1);
                child.setMinWidth(50);
                child.setMaxWidth(150);
                child.setHeight(55);
                break;
            }

            container.insertChild(child, j);
          }
        });

        // Multiple layout calculations with property changes
        root.calculateLayout(undefined, undefined);

        // Dynamic property changes during benchmark
        containers[0]?.setFlexDirection(OfficialYoga.FLEX_DIRECTION_COLUMN);
        containers[1]?.setJustifyContent(OfficialYoga.JUSTIFY_CENTER);
        root.calculateLayout(undefined, undefined);

        containers[2]?.setAlignItems(OfficialYoga.ALIGN_FLEX_END);
        containers[3]?.setFlexWrap(OfficialYoga.WRAP_WRAP_REVERSE);
        root.calculateLayout(undefined, undefined);

        // Final calculation
        root.calculateLayout(undefined, undefined);

        // Get layout to ensure calculations happened
        const layout = root.getComputedLayout();

        root.freeRecursive();
      },
      () => {
        // Bun.Yoga implementation - Same complex scenario
        const root = Bun.Yoga.Node.create();

        // Root container setup with advanced properties
        root.setWidth(800);
        root.setHeight(600);
        root.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);
        root.setJustifyContent(Bun.Yoga.JUSTIFY_SPACE_BETWEEN);
        root.setAlignItems(Bun.Yoga.ALIGN_STRETCH);
        root.setPadding(Bun.Yoga.EDGE_ALL, 20);
        root.setMargin(Bun.Yoga.EDGE_ALL, 10);
        root.setOverflow(Bun.Yoga.OVERFLOW_SCROLL);

        const containers: any[] = [];

        // Create 4 main containers with different layout patterns
        for (let i = 0; i < 4; i++) {
          const container = Bun.Yoga.Node.create();
          container.setFlexGrow(1);
          container.setFlexShrink(0);
          container.setFlexBasis("25%");
          container.setMargin(Bun.Yoga.EDGE_ALL, 5);
          container.setPadding(Bun.Yoga.EDGE_ALL, 10);

          // Vary container properties
          if (i === 0) {
            // Horizontal scrolling container
            container.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);
            container.setFlexWrap(Bun.Yoga.WRAP_NO_WRAP);
            container.setOverflow(Bun.Yoga.OVERFLOW_SCROLL);
            container.setJustifyContent(Bun.Yoga.JUSTIFY_FLEX_START);
          } else if (i === 1) {
            // Grid-like wrapping container
            container.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);
            container.setFlexWrap(Bun.Yoga.WRAP_WRAP);
            container.setAlignContent(Bun.Yoga.ALIGN_SPACE_BETWEEN);
            container.setJustifyContent(Bun.Yoga.JUSTIFY_SPACE_AROUND);
          } else if (i === 2) {
            // Absolute positioned container
            container.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);
            container.setPositionType(Bun.Yoga.POSITION_TYPE_RELATIVE);
            container.setAlignItems(Bun.Yoga.ALIGN_CENTER);
          } else {
            // Complex nested container
            container.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);
            container.setJustifyContent(Bun.Yoga.JUSTIFY_SPACE_EVENLY);
            container.setAlignItems(Bun.Yoga.ALIGN_STRETCH);
          }

          root.insertChild(container, i);
          containers.push(container);
        }

        // Populate each container with complex children
        containers.forEach((container, containerIndex) => {
          const childCount = 8 + containerIndex * 3; // Varying child counts

          for (let j = 0; j < childCount; j++) {
            const child = Bun.Yoga.Node.create();

            // Base properties for all children
            child.setPadding(Bun.Yoga.EDGE_ALL, 3);
            child.setMargin(Bun.Yoga.EDGE_ALL, 2);
            child.setBorder(Bun.Yoga.EDGE_ALL, 1);

            // Complex property variations based on position
            const variation = (containerIndex * childCount + j) % 12;

            switch (variation) {
              case 0: // Fixed size with aspect ratio
                child.setWidth(80);
                child.setAspectRatio(1.5);
                child.setFlexShrink(0);
                break;
              case 1: // Percentage width with min/max constraints
                child.setWidth("40%");
                child.setMinWidth(60);
                child.setMaxWidth(120);
                child.setHeight(50);
                break;
              case 2: // Flex grow with percentage height
                child.setFlexGrow(2);
                child.setHeight("15%");
                child.setMinHeight(30);
                child.setAlignSelf(Bun.Yoga.ALIGN_FLEX_START);
                break;
              case 3: // Absolute positioned
                child.setPositionType(Bun.Yoga.POSITION_TYPE_ABSOLUTE);
                child.setPosition(Bun.Yoga.EDGE_LEFT, 10 + j * 5);
                child.setPosition(Bun.Yoga.EDGE_TOP, 10 + j * 3);
                child.setWidth(40);
                child.setHeight(40);
                break;
              case 4: // Complex margin/padding variations
                child.setFlexGrow(1);
                child.setMargin(Bun.Yoga.EDGE_LEFT, 5);
                child.setMargin(Bun.Yoga.EDGE_RIGHT, 15);
                child.setPadding(Bun.Yoga.EDGE_TOP, 8);
                child.setPadding(Bun.Yoga.EDGE_BOTTOM, 12);
                child.setMinHeight(40);
                break;
              case 5: // Percentage-based with aspect ratio
                child.setWidth("30%");
                child.setAspectRatio(0.75);
                child.setFlexShrink(1);
                child.setAlignSelf(Bun.Yoga.ALIGN_CENTER);
                break;
              case 6: // Max constraints with flex
                child.setFlexGrow(1);
                child.setMaxWidth(100);
                child.setMaxHeight(80);
                child.setAlignSelf(Bun.Yoga.ALIGN_FLEX_END);
                break;
              case 7: // Hidden/Display variations
                if (j % 3 === 0) {
                  child.setDisplay(Bun.Yoga.DISPLAY_NONE);
                } else {
                  child.setDisplay(Bun.Yoga.DISPLAY_FLEX);
                  child.setFlexGrow(1);
                  child.setHeight(35);
                }
                break;
              case 8: // Complex border/padding combinations
                child.setBorder(Bun.Yoga.EDGE_LEFT, 3);
                child.setBorder(Bun.Yoga.EDGE_RIGHT, 1);
                child.setPadding(Bun.Yoga.EDGE_LEFT, 10);
                child.setPadding(Bun.Yoga.EDGE_RIGHT, 5);
                child.setWidth(70);
                child.setHeight(45);
                break;
              case 9: // Nested flex container
                child.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_ROW);
                child.setFlexGrow(1);
                child.setMinHeight(60);
                child.setJustifyContent(Bun.Yoga.JUSTIFY_SPACE_BETWEEN);

                // Add nested children
                for (let k = 0; k < 3; k++) {
                  const nested = Bun.Yoga.Node.create();
                  nested.setFlexGrow(1);
                  nested.setHeight(20);
                  nested.setMargin(Bun.Yoga.EDGE_ALL, 1);
                  nested.setAspectRatio(1.0);
                  child.insertChild(nested, k);
                }
                break;
              case 10: // Overflow and scrolling
                child.setOverflow(Bun.Yoga.OVERFLOW_SCROLL);
                child.setWidth(90);
                child.setHeight(70);
                child.setFlexShrink(0);
                break;
              case 11: // Complex positioning
                child.setPositionType(Bun.Yoga.POSITION_TYPE_RELATIVE);
                child.setPosition(Bun.Yoga.EDGE_LEFT, j * 2);
                child.setFlexGrow(1);
                child.setMinWidth(50);
                child.setMaxWidth(150);
                child.setHeight(55);
                break;
            }

            container.insertChild(child, j);
          }
        });

        // Multiple layout calculations with property changes
        root.calculateLayout(undefined, undefined);

        // Dynamic property changes during benchmark
        containers[0]?.setFlexDirection(Bun.Yoga.FLEX_DIRECTION_COLUMN);
        containers[1]?.setJustifyContent(Bun.Yoga.JUSTIFY_CENTER);
        root.calculateLayout(undefined, undefined);

        containers[2]?.setAlignItems(Bun.Yoga.ALIGN_FLEX_END);
        containers[3]?.setFlexWrap(Bun.Yoga.WRAP_WRAP_REVERSE);
        root.calculateLayout(undefined, undefined);

        // Final calculation
        root.calculateLayout(undefined, undefined);

        // Get layout to ensure calculations happened
        const layout = root.getComputedLayout();

        root.freeRecursive();
      }
    );

    this.runner.printResults("Advanced Features Stress Test", results);
    return results;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const iterations = args.length > 0 ? parseInt(args[0] ?? "10000", 10) : 10000;

  if (isNaN(iterations) || iterations <= 0) {
    console.error(
      `${colors.red}Invalid iterations count. Please provide a positive integer.${colors.reset}`
    );
    process.exit(1);
  }

  console.log(
    `${colors.bright}Starting benchmark with ${colors.cyan}${iterations}${colors.reset}${colors.bright} iterations per test${colors.reset}`
  );

  try {
    const scenarios = new BenchmarkScenarios(iterations);
    await scenarios.runAllBenchmarks();
  } catch (error) {
    console.error(`${colors.red}Benchmark failed:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.main) {
  main();
}
