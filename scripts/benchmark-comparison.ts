#!/usr/bin/env bun
/**
 * Standalone benchmark comparison runner
 * Usage: bun run scripts/benchmark-comparison.ts [iterations]
 */

// Import local yoga-ffi module
import LocalYoga, { Node as LocalNode, Config as LocalConfig } from "../src/index.ts";

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
  speedup: number;
}

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
    return sortedArray[Math.max(0, index)];
  }

  reset(): void {
    this.times = [];
  }
}

class BenchmarkRunner {
  private readonly iterations: number;

  constructor(iterations = 1000) {
    this.iterations = iterations;
  }

  async runBenchmark(
    name: string,
    localScenario: () => void,
    officialScenario: () => void
  ): Promise<BenchmarkComparison> {
    console.log(`\n🚀 Running benchmark: ${name}`);
    console.log(`📊 Iterations: ${this.iterations}`);

    // Warm up
    console.log("🔥 Warming up...");
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
    }

    const localStats = new PerformanceStats();
    const officialStats = new PerformanceStats();

    // Benchmark local implementation
    console.log("⚡ Benchmarking local yoga-ffi...");
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
    console.log("📦 Benchmarking official yoga-layout...");
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

    const localResult = localStats.getStats();
    const officialResult = officialStats.getStats();
    const speedup = officialResult.avg / localResult.avg;

    return {
      local: localResult,
      official: officialResult,
      speedup,
    };
  }

  printResults(name: string, results: BenchmarkComparison): void {
    console.log(`\n📈 Results for ${name}:`);
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│                      Performance Results                    │");
    console.log("├─────────────────────────────────────────────────────────────┤");
    console.log(`│ Metric          │ Local (ms)    │ Official (ms) │ Speedup   │`);
    console.log("├─────────────────────────────────────────────────────────────┤");
    console.log(`│ Total           │ ${this.formatNumber(results.local.total)}      │ ${this.formatNumber(results.official.total)}      │ ${this.formatSpeedup(results.speedup)}     │`);
    console.log(`│ Average         │ ${this.formatNumber(results.local.avg)}      │ ${this.formatNumber(results.official.avg)}      │ ${this.formatSpeedup(results.speedup)}     │`);
    console.log(`│ Median          │ ${this.formatNumber(results.local.median)}      │ ${this.formatNumber(results.official.median)}      │ ${this.formatSpeedup(results.official.median / results.local.median)}     │`);
    console.log(`│ P95             │ ${this.formatNumber(results.local.p95)}      │ ${this.formatNumber(results.official.p95)}      │ ${this.formatSpeedup(results.official.p95 / results.local.p95)}     │`);
    console.log(`│ P99             │ ${this.formatNumber(results.local.p99)}      │ ${this.formatNumber(results.official.p99)}      │ ${this.formatSpeedup(results.official.p99 / results.local.p99)}     │`);
    console.log(`│ Min             │ ${this.formatNumber(results.local.min)}      │ ${this.formatNumber(results.official.min)}      │ ${this.formatSpeedup(results.official.min / results.local.min)}     │`);
    console.log(`│ Max             │ ${this.formatNumber(results.local.max)}      │ ${this.formatNumber(results.official.max)}      │ ${this.formatSpeedup(results.official.max / results.local.max)}     │`);
    console.log("└─────────────────────────────────────────────────────────────┘");
    
    if (results.speedup > 1) {
      console.log(`🎉 Local implementation is ${this.formatSpeedup(results.speedup)} faster on average!`);
    } else {
      console.log(`📊 Official implementation is ${this.formatSpeedup(1 / results.speedup)} faster on average.`);
    }
  }

  private formatNumber(num: number): string {
    return num.toFixed(3).padStart(10);
  }

  private formatSpeedup(speedup: number): string {
    return `${speedup.toFixed(2)}x`.padStart(8);
  }

  printSummary(results: { [key: string]: BenchmarkComparison }): void {
    console.log("\n" + "=".repeat(80));
    console.log("🏆 BENCHMARK SUMMARY");
    console.log("=".repeat(80));
    
    let totalLocalWins = 0;
    let totalOfficialWins = 0;
    let avgSpeedup = 0;
    
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│                        Summary Results                      │");
    console.log("├─────────────────────────────────────────────────────────────┤");
    console.log(`│ Benchmark                     │ Winner        │ Speedup   │`);
    console.log("├─────────────────────────────────────────────────────────────┤");
    
    Object.entries(results).forEach(([name, result]) => {
      const winner = result.speedup > 1 ? "Local" : "Official";
      const speedup = result.speedup > 1 ? result.speedup : 1 / result.speedup;
      
      if (result.speedup > 1) {
        totalLocalWins++;
      } else {
        totalOfficialWins++;
      }
      
      avgSpeedup += result.speedup;
      
      console.log(`│ ${name.padEnd(29)} │ ${winner.padEnd(13)} │ ${this.formatSpeedup(speedup)}     │`);
    });
    
    console.log("└─────────────────────────────────────────────────────────────┘");
    
    avgSpeedup /= Object.keys(results).length;
    
    console.log(`\n📊 Overall Statistics:`);
    console.log(`   • Local wins: ${totalLocalWins}`);
    console.log(`   • Official wins: ${totalOfficialWins}`);
    console.log(`   • Average speedup: ${this.formatSpeedup(avgSpeedup)}`);
    
    if (avgSpeedup > 1) {
      console.log(`\n🎉 Overall, the local yoga-ffi implementation is ${this.formatSpeedup(avgSpeedup)} faster!`);
    } else {
      console.log(`\n📈 Overall, the official yoga-layout implementation is ${this.formatSpeedup(1 / avgSpeedup)} faster.`);
    }
  }
}

// Benchmark scenarios
class BenchmarkScenarios {
  private runner: BenchmarkRunner;
  private results: { [key: string]: BenchmarkComparison } = {};

  constructor(iterations = 1000) {
    this.runner = new BenchmarkRunner(iterations);
  }

  async runAllBenchmarks(): Promise<void> {
    console.log("🏁 Starting comprehensive yoga-ffi vs yoga-layout benchmark");
    console.log("=".repeat(80));

    this.results["Simple Layout"] = await this.simpleLayoutBenchmark();
    this.results["Layout Changes"] = await this.layoutChangesBenchmark();
    this.results["Dynamic Complexity"] = await this.dynamicComplexityBenchmark();
    this.results["Deep Nested Layout"] = await this.nestedLayoutBenchmark();
    this.results["Complex Flex Layout"] = await this.flexLayoutBenchmark();

    this.runner.printSummary(this.results);
    console.log("\n🎯 All benchmarks completed!");
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
        root.setPadding("all", 10);
        root.setMargin("all", 5);
        
        root.calculateLayout();
        
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
        
        root.calculateLayout();
        
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
        root.calculateLayout();
        
        // Change 1: Resize
        root.setWidth(150);
        root.setHeight(150);
        root.calculateLayout();
        
        // Change 2: Add padding
        root.setPadding("all", 20);
        root.calculateLayout();
        
        // Change 3: Change flex properties
        root.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
        root.setJustifyContent(LocalYoga.JUSTIFY_CENTER);
        root.calculateLayout();
        
        root.free();
        config.free();
      },
      () => {
        // Official implementation
        const root = OfficialYoga.Node.create();
        
        // Initial layout
        root.setWidth(100);
        root.setHeight(100);
        root.calculateLayout();
        
        // Change 1: Resize
        root.setWidth(150);
        root.setHeight(150);
        root.calculateLayout();
        
        // Change 2: Add padding
        root.setPadding(OfficialYoga.EDGE_ALL, 20);
        root.calculateLayout();
        
        // Change 3: Change flex properties
        root.setFlexDirection(OfficialYoga.FLEX_DIRECTION_ROW);
        root.setJustifyContent(OfficialYoga.JUSTIFY_CENTER);
        root.calculateLayout();
        
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
          child.setMargin("all", 2);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout();
        
        // Stage 2: Add 10 more children (15 total)
        for (let i = 5; i < 15; i++) {
          const child = new LocalNode(config);
          child.setFlexGrow(1);
          child.setMargin("all", 2);
          child.setPadding("all", 5);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout();
        
        // Stage 3: Add nested children to some nodes
        for (let i = 0; i < 5; i++) {
          const parent = children[i];
          parent.setFlexDirection(LocalYoga.FLEX_DIRECTION_ROW);
          
          for (let j = 0; j < 3; j++) {
            const grandchild = new LocalNode(config);
            grandchild.setFlexGrow(1);
            grandchild.setWidth(20);
            grandchild.setHeight(20);
            parent.insertChild(grandchild, j);
          }
        }
        root.calculateLayout();
        
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
        root.calculateLayout();
        
        // Stage 2: Add 10 more children (15 total)
        for (let i = 5; i < 15; i++) {
          const child = OfficialYoga.Node.create();
          child.setFlexGrow(1);
          child.setMargin(OfficialYoga.EDGE_ALL, 2);
          child.setPadding(OfficialYoga.EDGE_ALL, 5);
          root.insertChild(child, i);
          children.push(child);
        }
        root.calculateLayout();
        
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
        root.calculateLayout();
        
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
          level1.setPadding("all", 5);
          root.insertChild(level1, i);
          
          for (let j = 0; j < 4; j++) {
            const level2 = new LocalNode(config);
            level2.setFlexGrow(1);
            level2.setFlexDirection(LocalYoga.FLEX_DIRECTION_COLUMN);
            level2.setMargin("all", 3);
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
        
        root.calculateLayout();
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
        
        root.calculateLayout();
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
          item.setMargin("all", 2);
          
          // Vary some properties
          if (i % 3 === 0) {
            item.setFlexGrow(1);
          }
          if (i % 5 === 0) {
            item.setAlignSelf(LocalYoga.ALIGN_CENTER);
          }
          
          root.insertChild(item, i);
        }
        
        root.calculateLayout();
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
        
        root.calculateLayout();
        root.freeRecursive();
      }
    );

    this.runner.printResults("Complex Flex Layout", results);
    return results;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const iterations = args.length > 0 ? parseInt(args[0], 10) : 1000;
  
  if (isNaN(iterations) || iterations <= 0) {
    console.error("❌ Invalid iterations count. Please provide a positive integer.");
    process.exit(1);
  }
  
  console.log(`🏃‍♂️ Starting benchmark with ${iterations} iterations per test`);
  
  try {
    const scenarios = new BenchmarkScenarios(iterations);
    await scenarios.runAllBenchmarks();
  } catch (error) {
    console.error("❌ Benchmark failed:", error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.main) {
  main();
}
