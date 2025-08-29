/**
 * Smoke test to verify basic yoga library functionality
 */

import { describe, expect, test } from "bun:test";
import { yoga, Node, Config } from "../index.ts";

describe("Yoga Library Smoke Tests", () => {
  test("should load yoga library successfully", () => {
    expect(yoga).toBeDefined();
    expect(yoga.createNode).toBeFunction();
    expect(yoga.createConfig).toBeFunction();
    expect(yoga.enums).toBeDefined();
  });

  test("should create and use nodes with direct API", () => {
    const config = yoga.createConfig();
    const node = yoga.createNode();

    expect(config).toBeDefined();
    expect(node).toBeDefined();

    // Set basic properties
    node.setWidth(100);
    node.setHeight(200);

    // Calculate layout
    node.calculateLayout(undefined, undefined, yoga.enums.DirectionLTR);

    // Check computed values
    expect(node.getComputedWidth()).toBe(100);
    expect(node.getComputedHeight()).toBe(200);

    // Cleanup
    node.free();
    config.free();
  });

  test("should create and use nodes with compatibility API", () => {
    const config = new Config();
    const node = new Node(config);

    expect(config).toBeDefined();
    expect(node).toBeDefined();

    // Set basic properties
    node.setWidth(150);
    node.setHeight(300);
    node.setPadding("all", 10);

    // Calculate layout
    node.calculateLayout(undefined, undefined);

    // Check computed layout
    const layout = node.getComputedLayout();
    expect(layout.width).toBe(150);
    expect(layout.height).toBe(300);
    expect(layout.left).toBe(0);
    expect(layout.top).toBe(0);

    // Cleanup
    node.free();
    config.free();
  });

  test("should have access to yoga enums", () => {
    expect(yoga.enums.DirectionLTR).toBeDefined();
    expect(yoga.enums.DirectionRTL).toBeDefined();
    expect(yoga.enums.FlexDirectionRow).toBeDefined();
    expect(yoga.enums.FlexDirectionColumn).toBeDefined();
    expect(yoga.enums.JustifyFlexStart).toBeDefined();
    expect(yoga.enums.AlignCenter).toBeDefined();
  });
});
