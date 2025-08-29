// Yoga-layout compatible interface

import { resolveYogaLib } from "./zig.ts";

// Export all the enum types to match yoga-layout
export enum Align {
  Auto = 0,
  FlexStart = 1,
  Center = 2,
  FlexEnd = 3,
  Stretch = 4,
  Baseline = 5,
  SpaceBetween = 6,
  SpaceAround = 7,
  SpaceEvenly = 8,
}

export enum BoxSizing {
  BorderBox = 0,
  ContentBox = 1,
}

export enum Dimension {
  Width = 0,
  Height = 1,
}

export enum Direction {
  Inherit = 0,
  LTR = 1,
  RTL = 2,
}

export enum Display {
  Flex = 0,
  None = 1,
  Contents = 2,
}

export enum Edge {
  Left = 0,
  Top = 1,
  Right = 2,
  Bottom = 3,
  Start = 4,
  End = 5,
  Horizontal = 6,
  Vertical = 7,
  All = 8,
}

export enum Errata {
  None = 0,
  StretchFlexBasis = 1,
  AbsolutePositionWithoutInsetsExcludesPadding = 2,
  AbsolutePercentAgainstInnerSize = 4,
  All = 2147483647,
  Classic = 2147483646,
}

export enum ExperimentalFeature {
  WebFlexBasis = 0,
}

export enum FlexDirection {
  Column = 0,
  ColumnReverse = 1,
  Row = 2,
  RowReverse = 3,
}

export enum Gutter {
  Column = 0,
  Row = 1,
  All = 2,
}

export enum Justify {
  FlexStart = 0,
  Center = 1,
  FlexEnd = 2,
  SpaceBetween = 3,
  SpaceAround = 4,
  SpaceEvenly = 5,
}

export enum LogLevel {
  Error = 0,
  Warn = 1,
  Info = 2,
  Debug = 3,
  Verbose = 4,
  Fatal = 5,
}

export enum MeasureMode {
  Undefined = 0,
  Exactly = 1,
  AtMost = 2,
}

export enum NodeType {
  Default = 0,
  Text = 1,
}

export enum Overflow {
  Visible = 0,
  Hidden = 1,
  Scroll = 2,
}

export enum PositionType {
  Static = 0,
  Relative = 1,
  Absolute = 2,
}

export enum Unit {
  Undefined = 0,
  Point = 1,
  Percent = 2,
  Auto = 3,
}

export enum Wrap {
  NoWrap = 0,
  Wrap = 1,
  WrapReverse = 2,
}

// Value type
export type Value = {
  unit: Unit;
  value: number;
  valueOf(): number;
};

// Layout type  
export type Layout = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

// Size type
export type Size = {
  width: number;
  height: number;
};

// Function types
export type DirtiedFunction = (node: Node) => void;
export type MeasureFunction = (
  width: number,
  widthMode: MeasureMode,
  height: number,
  heightMode: MeasureMode,
) => Size;

// Helper function to create Value objects
function createValue(value: number, unit: Unit): Value {
  return {
    unit,
    value,
    valueOf(): number {
      return this.value;
    },
  };
}

// Helper function to parse string/number values
function parseValue(input: number | string | 'auto' | undefined): { unit: Unit; value: number } {
  if (input === undefined) {
    return { unit: Unit.Undefined, value: 0 };
  }
  if (input === 'auto') {
    return { unit: Unit.Auto, value: 0 };
  }
  if (typeof input === 'string' && input.endsWith('%')) {
    return { unit: Unit.Percent, value: parseFloat(input) };
  }
  return { unit: Unit.Point, value: typeof input === 'string' ? parseFloat(input) : input };
}

// Config implementation
export class Config {
  private yogaConfig: any;

  constructor() {
    const yoga = resolveYogaLib();
    this.yogaConfig = yoga.createConfig();
  }

  free(): void {
    this.yogaConfig.free();
  }

  isExperimentalFeatureEnabled(_feature: ExperimentalFeature): boolean {
    // Not implemented in our Yoga FFI, return false
    return false;
  }

  setExperimentalFeatureEnabled(_feature: ExperimentalFeature, _enabled: boolean): void {
    // Not implemented in our Yoga FFI, no-op
  }

  setPointScaleFactor(factor: number): void {
    this.yogaConfig.setPointScaleFactor(factor);
  }

  getErrata(): Errata {
    // Not implemented in our Yoga FFI, return None
    return Errata.None;
  }

  setErrata(_errata: Errata): void {
    // Not implemented in our Yoga FFI, no-op  
  }

  useWebDefaults(): boolean {
    return this.yogaConfig.getUseWebDefaults();
  }

  setUseWebDefaults(useWebDefaults: boolean): void {
    this.yogaConfig.setUseWebDefaults(useWebDefaults);
  }

  static create(): Config {
    return new Config();
  }

  static destroy(config: Config): void {
    config.free();
  }
}

// Node implementation
export class Node {
  private yogaNode: any;
  private config?: Config;

  constructor(config?: Config) {
    const yoga = resolveYogaLib();
    if (config) {
      this.config = config;
      this.yogaNode = yoga.createNodeWithConfig((config as any).yogaConfig);
    } else {
      this.yogaNode = yoga.createNode();
    }
  }

  // Layout calculation
  calculateLayout(
    width: number | 'auto' | undefined,
    height: number | 'auto' | undefined,
    direction?: Direction,
  ): void {
    const w = width === 'auto' || width === undefined ? NaN : width;
    const h = height === 'auto' || height === undefined ? NaN : height;
    const dir = direction ?? Direction.LTR;
    this.yogaNode.calculateLayout(w, h, dir);
  }

  // Memory management
  free(): void {
    this.yogaNode.free();
  }

  freeRecursive(): void {
    this.yogaNode.freeRecursive();
  }

  // Hierarchy methods
  insertChild(child: Node, index: number): void {
    this.yogaNode.insertChild((child as any).yogaNode, index);
  }

  removeChild(child: Node): void {
    this.yogaNode.removeChild((child as any).yogaNode);
  }

  getChild(index: number): Node {
    const childNode = this.yogaNode.getChild(index);
    if (!childNode) throw new Error("Child not found");
    // Wrap the returned node
    const node = new Node();
    (node as any).yogaNode = childNode;
    return node;
  }

  getChildCount(): number {
    return this.yogaNode.getChildCount();
  }

  getParent(): Node | null {
    const parentNode = this.yogaNode.getParent();
    if (!parentNode) return null;
    // Wrap the returned node
    const node = new Node();
    (node as any).yogaNode = parentNode;
    return node;
  }

  // Layout results
  getComputedLayout(): Layout {
    return {
      left: this.yogaNode.getComputedLeft(),
      top: this.yogaNode.getComputedTop(), 
      right: this.yogaNode.getComputedRight(),
      bottom: this.yogaNode.getComputedBottom(),
      width: this.yogaNode.getComputedWidth(),
      height: this.yogaNode.getComputedHeight(),
    };
  }

  getComputedLeft(): number {
    return this.yogaNode.getComputedLeft();
  }

  getComputedTop(): number {
    return this.yogaNode.getComputedTop();
  }

  getComputedRight(): number {
    return this.yogaNode.getComputedRight();
  }

  getComputedBottom(): number {
    return this.yogaNode.getComputedBottom();
  }

  getComputedWidth(): number {
    return this.yogaNode.getComputedWidth();
  }

  getComputedHeight(): number {
    return this.yogaNode.getComputedHeight();
  }

  // Style getters - returning Value objects for dimensions
  getWidth(): Value {
    // Since our FFI doesn't track the original unit, we assume Point for non-NaN values
    const value = this.yogaNode.getComputedWidth();
    return createValue(value, Unit.Point);
  }

  getHeight(): Value {
    const value = this.yogaNode.getComputedHeight();
    return createValue(value, Unit.Point);
  }

  // Style getters - simple values
  getAlignContent(): Align {
    return this.yogaNode.getAlignContent();
  }

  getAlignItems(): Align {
    return this.yogaNode.getAlignItems();
  }

  getAlignSelf(): Align {
    return this.yogaNode.getAlignSelf();
  }

  getAspectRatio(): number {
    return this.yogaNode.getAspectRatio();
  }

  getBorder(edge: Edge): number {
    return this.yogaNode.getBorder(edge);
  }

  getDirection(): Direction {
    return this.yogaNode.getDirection();
  }

  getDisplay(): Display {
    return this.yogaNode.getDisplay();
  }

  getFlexDirection(): FlexDirection {
    return this.yogaNode.getFlexDirection();
  }

  getFlexGrow(): number {
    return this.yogaNode.getFlexGrow();
  }

  getFlexShrink(): number {
    return this.yogaNode.getFlexShrink();
  }

  getFlexWrap(): Wrap {
    return this.yogaNode.getFlexWrap();
  }

  getJustifyContent(): Justify {
    return this.yogaNode.getJustifyContent();
  }

  getOverflow(): Overflow {
    return this.yogaNode.getOverflow();
  }

  getPositionType(): PositionType {
    return this.yogaNode.getPositionType();
  }

  // Style setters with value parsing
  setWidth(width: number | 'auto' | `${number}%` | undefined): void {
    const parsed = parseValue(width);
    switch (parsed.unit) {
      case Unit.Auto:
        this.yogaNode.setWidthAuto();
        break;
      case Unit.Percent:
        this.yogaNode.setWidthPercent(parsed.value);
        break;
      default:
        this.yogaNode.setWidth(parsed.value);
        break;
    }
  }

  setWidthAuto(): void {
    this.yogaNode.setWidthAuto();
  }

  setWidthPercent(width: number | undefined): void {
    if (width !== undefined) {
      this.yogaNode.setWidthPercent(width);
    }
  }

  setHeight(height: number | 'auto' | `${number}%` | undefined): void {
    const parsed = parseValue(height);
    switch (parsed.unit) {
      case Unit.Auto:
        this.yogaNode.setHeightAuto();
        break;
      case Unit.Percent:
        this.yogaNode.setHeightPercent(parsed.value);
        break;
      default:
        this.yogaNode.setHeight(parsed.value);
        break;
    }
  }

  setHeightAuto(): void {
    this.yogaNode.setHeightAuto();
  }

  setHeightPercent(height: number | undefined): void {
    if (height !== undefined) {
      this.yogaNode.setHeightPercent(height);
    }
  }

  // Other style setters
  setAlignContent(alignContent: Align): void {
    this.yogaNode.setAlignContent(alignContent);
  }

  setAlignItems(alignItems: Align): void {
    this.yogaNode.setAlignItems(alignItems);
  }

  setAlignSelf(alignSelf: Align): void {
    this.yogaNode.setAlignSelf(alignSelf);
  }

  setAspectRatio(aspectRatio: number | undefined): void {
    if (aspectRatio !== undefined) {
      this.yogaNode.setAspectRatio(aspectRatio);
    }
  }

  setBorder(edge: Edge, borderWidth: number | undefined): void {
    if (borderWidth !== undefined) {
      this.yogaNode.setBorder(edge, borderWidth);
    }
  }

  setDirection(direction: Direction): void {
    this.yogaNode.setDirection(direction);
  }

  setDisplay(display: Display): void {
    this.yogaNode.setDisplay(display);
  }

  setFlex(flex: number | undefined): void {
    if (flex !== undefined) {
      this.yogaNode.setFlex(flex);
    }
  }

  setFlexBasis(flexBasis: number | 'auto' | `${number}%` | undefined): void {
    const parsed = parseValue(flexBasis);
    switch (parsed.unit) {
      case Unit.Auto:
        this.yogaNode.setFlexBasisAuto();
        break;
      case Unit.Percent:
        this.yogaNode.setFlexBasisPercent(parsed.value);
        break;
      default:
        this.yogaNode.setFlexBasis(parsed.value);
        break;
    }
  }

  setFlexBasisAuto(): void {
    this.yogaNode.setFlexBasisAuto();
  }

  setFlexBasisPercent(flexBasis: number | undefined): void {
    if (flexBasis !== undefined) {
      this.yogaNode.setFlexBasisPercent(flexBasis);
    }
  }

  setFlexDirection(flexDirection: FlexDirection): void {
    this.yogaNode.setFlexDirection(flexDirection);
  }

  setFlexGrow(flexGrow: number | undefined): void {
    if (flexGrow !== undefined) {
      this.yogaNode.setFlexGrow(flexGrow);
    }
  }

  setFlexShrink(flexShrink: number | undefined): void {
    if (flexShrink !== undefined) {
      this.yogaNode.setFlexShrink(flexShrink);
    }
  }

  setFlexWrap(flexWrap: Wrap): void {
    this.yogaNode.setFlexWrap(flexWrap);
  }

  setJustifyContent(justifyContent: Justify): void {
    this.yogaNode.setJustifyContent(justifyContent);
  }

  setOverflow(overflow: Overflow): void {
    this.yogaNode.setOverflow(overflow);
  }

  setPositionType(positionType: PositionType): void {
    this.yogaNode.setPositionType(positionType);
  }

  // Position methods
  setPosition(edge: Edge, position: number | `${number}%` | undefined): void {
    const parsed = parseValue(position);
    switch (parsed.unit) {
      case Unit.Percent:
        this.yogaNode.setPositionPercent(edge, parsed.value);
        break;
      default:
        this.yogaNode.setPosition(edge, parsed.value);
        break;
    }
  }

  setPositionPercent(edge: Edge, position: number | undefined): void {
    if (position !== undefined) {
      this.yogaNode.setPositionPercent(edge, position);
    }
  }

  setPositionAuto(edge: Edge): void {
    this.yogaNode.setPositionAuto(edge);
  }

  // Margin methods
  setMargin(edge: Edge, margin: number | 'auto' | `${number}%` | undefined): void {
    const parsed = parseValue(margin);
    switch (parsed.unit) {
      case Unit.Auto:
        this.yogaNode.setMarginAuto(edge);
        break;
      case Unit.Percent:
        this.yogaNode.setMarginPercent(edge, parsed.value);
        break;
      default:
        this.yogaNode.setMargin(edge, parsed.value);
        break;
    }
  }

  setMarginAuto(edge: Edge): void {
    this.yogaNode.setMarginAuto(edge);
  }

  setMarginPercent(edge: Edge, margin: number | undefined): void {
    if (margin !== undefined) {
      this.yogaNode.setMarginPercent(edge, margin);
    }
  }

  // Padding methods
  setPadding(edge: Edge, padding: number | `${number}%` | undefined): void {
    const parsed = parseValue(padding);
    switch (parsed.unit) {
      case Unit.Percent:
        this.yogaNode.setPaddingPercent(edge, parsed.value);
        break;
      default:
        this.yogaNode.setPadding(edge, parsed.value);
        break;
    }
  }

  setPaddingPercent(edge: Edge, padding: number | undefined): void {
    if (padding !== undefined) {
      this.yogaNode.setPaddingPercent(edge, padding);
    }
  }

  // Min/Max size methods
  setMinWidth(minWidth: number | `${number}%` | undefined): void {
    const parsed = parseValue(minWidth);
    switch (parsed.unit) {
      case Unit.Percent:
        this.yogaNode.setMinWidthPercent(parsed.value);
        break;
      default:
        this.yogaNode.setMinWidth(parsed.value);
        break;
    }
  }

  setMinWidthPercent(minWidth: number | undefined): void {
    if (minWidth !== undefined) {
      this.yogaNode.setMinWidthPercent(minWidth);
    }
  }

  setMinHeight(minHeight: number | `${number}%` | undefined): void {
    const parsed = parseValue(minHeight);
    switch (parsed.unit) {
      case Unit.Percent:
        this.yogaNode.setMinHeightPercent(parsed.value);
        break;
      default:
        this.yogaNode.setMinHeight(parsed.value);
        break;
    }
  }

  setMinHeightPercent(minHeight: number | undefined): void {
    if (minHeight !== undefined) {
      this.yogaNode.setMinHeightPercent(minHeight);
    }
  }

  setMaxWidth(maxWidth: number | `${number}%` | undefined): void {
    const parsed = parseValue(maxWidth);
    switch (parsed.unit) {
      case Unit.Percent:
        this.yogaNode.setMaxWidthPercent(parsed.value);
        break;
      default:
        this.yogaNode.setMaxWidth(parsed.value);
        break;
    }
  }

  setMaxWidthPercent(maxWidth: number | undefined): void {
    if (maxWidth !== undefined) {
      this.yogaNode.setMaxWidthPercent(maxWidth);
    }
  }

  setMaxHeight(maxHeight: number | `${number}%` | undefined): void {
    const parsed = parseValue(maxHeight);
    switch (parsed.unit) {
      case Unit.Percent:
        this.yogaNode.setMaxHeightPercent(parsed.value);
        break;
      default:
        this.yogaNode.setMaxHeight(parsed.value);
        break;
    }
  }

  setMaxHeightPercent(maxHeight: number | undefined): void {
    if (maxHeight !== undefined) {
      this.yogaNode.setMaxHeightPercent(maxHeight);
    }
  }

  // Other methods that yoga-layout has but we don't fully implement
  copyStyle(_node: Node): void {
    // Not implemented - would need to copy all style properties
    throw new Error("copyStyle not implemented");
  }

  getComputedBorder(edge: Edge): number {
    return this.getBorder(edge);
  }

  getComputedMargin(_edge: Edge): number {
    // Not implemented in our FFI
    return 0;
  }

  getComputedPadding(_edge: Edge): number {
    // Not implemented in our FFI
    return 0;
  }

  getFlexBasis(): Value {
    // Not implemented - return undefined
    return createValue(0, Unit.Undefined);
  }

  getGap(_gutter: Gutter): Value {
    // Not implemented
    return createValue(0, Unit.Undefined);
  }

  getMargin(_edge: Edge): Value {
    // Not implemented - return undefined
    return createValue(0, Unit.Undefined);
  }

  getMaxHeight(): Value {
    return createValue(0, Unit.Undefined);
  }

  getMaxWidth(): Value {
    return createValue(0, Unit.Undefined);
  }

  getMinHeight(): Value {
    return createValue(0, Unit.Undefined);
  }

  getMinWidth(): Value {
    return createValue(0, Unit.Undefined);
  }

  getPadding(_edge: Edge): Value {
    return createValue(0, Unit.Undefined);
  }

  getPosition(_edge: Edge): Value {
    return createValue(0, Unit.Undefined);
  }

  getBoxSizing(): BoxSizing {
    // Not implemented
    return BoxSizing.BorderBox;
  }

  hasNewLayout(): boolean {
    return this.yogaNode.getHasNewLayout();
  }

  isDirty(): boolean {
    // Not implemented
    return false;
  }

  isReferenceBaseline(): boolean {
    // Not implemented  
    return false;
  }

  markDirty(): void {
    this.yogaNode.markDirty();
  }

  markLayoutSeen(): void {
    this.yogaNode.setHasNewLayout(false);
  }

  reset(): void {
    this.yogaNode.reset();
  }

  setIsReferenceBaseline(_isReferenceBaseline: boolean): void {
    // Not implemented
  }

  setGap(_gutter: Gutter, _gapLength: number | `${number}%` | undefined): Value {
    // Not implemented
    return createValue(0, Unit.Undefined);
  }

  setGapPercent(_gutter: Gutter, _gapLength: number | undefined): Value {
    // Not implemented
    return createValue(0, Unit.Undefined);
  }

  setDirtiedFunc(_dirtiedFunc: DirtiedFunction | null): void {
    // Not implemented in our FFI
  }

  setMeasureFunc(_measureFunc: MeasureFunction | null): void {
    // Not implemented in our FFI
  }

  setBoxSizing(_boxSizing: BoxSizing): void {
    // Not implemented
  }

  setAlwaysFormsContainingBlock(_alwaysFormsContainingBlock: boolean): void {
    // Not implemented
  }

  unsetDirtiedFunc(): void {
    // Not implemented
  }

  unsetMeasureFunc(): void {
    // Not implemented
  }

  static create(config?: Config): Node {
    return new Node(config);
  }

  static createDefault(): Node {
    return new Node();
  }

  static createWithConfig(config: Config): Node {
    return new Node(config);
  }

  static destroy(node: Node): void {
    node.free();
  }
}

// Enum constants (matching yoga-layout format)
const constants = {
  ALIGN_AUTO: Align.Auto,
  ALIGN_FLEX_START: Align.FlexStart,
  ALIGN_CENTER: Align.Center,
  ALIGN_FLEX_END: Align.FlexEnd,
  ALIGN_STRETCH: Align.Stretch,
  ALIGN_BASELINE: Align.Baseline,
  ALIGN_SPACE_BETWEEN: Align.SpaceBetween,
  ALIGN_SPACE_AROUND: Align.SpaceAround,
  ALIGN_SPACE_EVENLY: Align.SpaceEvenly,
  BOX_SIZING_BORDER_BOX: BoxSizing.BorderBox,
  BOX_SIZING_CONTENT_BOX: BoxSizing.ContentBox,
  DIMENSION_WIDTH: Dimension.Width,
  DIMENSION_HEIGHT: Dimension.Height,
  DIRECTION_INHERIT: Direction.Inherit,
  DIRECTION_LTR: Direction.LTR,
  DIRECTION_RTL: Direction.RTL,
  DISPLAY_FLEX: Display.Flex,
  DISPLAY_NONE: Display.None,
  DISPLAY_CONTENTS: Display.Contents,
  EDGE_LEFT: Edge.Left,
  EDGE_TOP: Edge.Top,
  EDGE_RIGHT: Edge.Right,
  EDGE_BOTTOM: Edge.Bottom,
  EDGE_START: Edge.Start,
  EDGE_END: Edge.End,
  EDGE_HORIZONTAL: Edge.Horizontal,
  EDGE_VERTICAL: Edge.Vertical,
  EDGE_ALL: Edge.All,
  ERRATA_NONE: Errata.None,
  ERRATA_STRETCH_FLEX_BASIS: Errata.StretchFlexBasis,
  ERRATA_ABSOLUTE_POSITION_WITHOUT_INSETS_EXCLUDES_PADDING: Errata.AbsolutePositionWithoutInsetsExcludesPadding,
  ERRATA_ABSOLUTE_PERCENT_AGAINST_INNER_SIZE: Errata.AbsolutePercentAgainstInnerSize,
  ERRATA_ALL: Errata.All,
  ERRATA_CLASSIC: Errata.Classic,
  EXPERIMENTAL_FEATURE_WEB_FLEX_BASIS: ExperimentalFeature.WebFlexBasis,
  FLEX_DIRECTION_COLUMN: FlexDirection.Column,
  FLEX_DIRECTION_COLUMN_REVERSE: FlexDirection.ColumnReverse,
  FLEX_DIRECTION_ROW: FlexDirection.Row,
  FLEX_DIRECTION_ROW_REVERSE: FlexDirection.RowReverse,
  GUTTER_COLUMN: Gutter.Column,
  GUTTER_ROW: Gutter.Row,
  GUTTER_ALL: Gutter.All,
  JUSTIFY_FLEX_START: Justify.FlexStart,
  JUSTIFY_CENTER: Justify.Center,
  JUSTIFY_FLEX_END: Justify.FlexEnd,
  JUSTIFY_SPACE_BETWEEN: Justify.SpaceBetween,
  JUSTIFY_SPACE_AROUND: Justify.SpaceAround,
  JUSTIFY_SPACE_EVENLY: Justify.SpaceEvenly,
  LOG_LEVEL_ERROR: LogLevel.Error,
  LOG_LEVEL_WARN: LogLevel.Warn,
  LOG_LEVEL_INFO: LogLevel.Info,
  LOG_LEVEL_DEBUG: LogLevel.Debug,
  LOG_LEVEL_VERBOSE: LogLevel.Verbose,
  LOG_LEVEL_FATAL: LogLevel.Fatal,
  MEASURE_MODE_UNDEFINED: MeasureMode.Undefined,
  MEASURE_MODE_EXACTLY: MeasureMode.Exactly,
  MEASURE_MODE_AT_MOST: MeasureMode.AtMost,
  NODE_TYPE_DEFAULT: NodeType.Default,
  NODE_TYPE_TEXT: NodeType.Text,
  OVERFLOW_VISIBLE: Overflow.Visible,
  OVERFLOW_HIDDEN: Overflow.Hidden,
  OVERFLOW_SCROLL: Overflow.Scroll,
  POSITION_TYPE_STATIC: PositionType.Static,
  POSITION_TYPE_RELATIVE: PositionType.Relative,
  POSITION_TYPE_ABSOLUTE: PositionType.Absolute,
  UNIT_UNDEFINED: Unit.Undefined,
  UNIT_POINT: Unit.Point,
  UNIT_PERCENT: Unit.Percent,
  UNIT_AUTO: Unit.Auto,
  WRAP_NO_WRAP: Wrap.NoWrap,
  WRAP_WRAP: Wrap.Wrap,
  WRAP_WRAP_REVERSE: Wrap.WrapReverse,
};

// Main Yoga export matching yoga-layout structure
export const Yoga = {
  Config,
  Node,
  ...constants,
};

// Types are exported alongside class declarations above

export default Yoga;