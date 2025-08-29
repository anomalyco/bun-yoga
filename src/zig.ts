import { dlopen, type Pointer, JSCallback, FFIType } from "bun:ffi";

// Yoga enum definitions copied from yoga-layout package
// Copyright (c) Meta Platforms, Inc. and affiliates.
// This source code is licensed under the MIT license

export const Align = {
  Auto: 0,
  FlexStart: 1,
  Center: 2,
  FlexEnd: 3,
  Stretch: 4,
  Baseline: 5,
  SpaceBetween: 6,
  SpaceAround: 7,
  SpaceEvenly: 8,
} as const;

export const BoxSizing = {
  BorderBox: 0,
  ContentBox: 1,
} as const;

export const Dimension = {
  Width: 0,
  Height: 1,
} as const;

export const Direction = {
  Inherit: 0,
  LTR: 1,
  RTL: 2,
} as const;

export const Display = {
  Flex: 0,
  None: 1,
  Contents: 2,
} as const;

export const Edge = {
  Left: 0,
  Top: 1,
  Right: 2,
  Bottom: 3,
  Start: 4,
  End: 5,
  Horizontal: 6,
  Vertical: 7,
  All: 8,
} as const;

export const Errata = {
  None: 0,
  StretchFlexBasis: 1,
  AbsolutePositionWithoutInsetsExcludesPadding: 2,
  AbsolutePercentAgainstInnerSize: 4,
  All: 2147483647,
  Classic: 2147483646,
} as const;

export const ExperimentalFeature = {
  WebFlexBasis: 0,
} as const;

export const FlexDirection = {
  Column: 0,
  ColumnReverse: 1,
  Row: 2,
  RowReverse: 3,
} as const;

export const Gutter = {
  Column: 0,
  Row: 1,
  All: 2,
} as const;

export const Justify = {
  FlexStart: 0,
  Center: 1,
  FlexEnd: 2,
  SpaceBetween: 3,
  SpaceAround: 4,
  SpaceEvenly: 5,
} as const;

export const LogLevel = {
  Error: 0,
  Warn: 1,
  Info: 2,
  Debug: 3,
  Verbose: 4,
  Fatal: 5,
} as const;

export const MeasureMode = {
  Undefined: 0,
  Exactly: 1,
  AtMost: 2,
} as const;

export const NodeType = {
  Default: 0,
  Text: 1,
} as const;

export const Overflow = {
  Visible: 0,
  Hidden: 1,
  Scroll: 2,
} as const;

export const PositionType = {
  Static: 0,
  Relative: 1,
  Absolute: 2,
} as const;

export const Unit = {
  Undefined: 0,
  Point: 1,
  Percent: 2,
  Auto: 3,
} as const;

export const Wrap = {
  NoWrap: 0,
  Wrap: 1,
  WrapReverse: 2,
} as const;

function getYogaLib(libPath: string) {
  return dlopen(libPath, {
    // Config functions
    ygConfigNew: {
      args: [],
      returns: "ptr",
    },
    ygConfigFree: {
      args: ["ptr"],
      returns: "void",
    },
    ygConfigGetDefault: {
      args: [],
      returns: "ptr",
    },
    ygConfigSetUseWebDefaults: {
      args: ["ptr", "bool"],
      returns: "void",
    },
    ygConfigGetUseWebDefaults: {
      args: ["ptr"],
      returns: "bool",
    },
    ygConfigSetPointScaleFactor: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygConfigGetPointScaleFactor: {
      args: ["ptr"],
      returns: "f32",
    },

    // Node creation and management
    ygNodeNew: {
      args: [],
      returns: "ptr",
    },
    ygNodeNewWithConfig: {
      args: ["ptr"],
      returns: "ptr",
    },
    ygNodeClone: {
      args: ["ptr"],
      returns: "ptr",
    },
    ygNodeFree: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeFreeRecursive: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeReset: {
      args: ["ptr"],
      returns: "void",
    },

    // Node hierarchy management
    ygNodeInsertChild: {
      args: ["ptr", "ptr", "u64"],
      returns: "void",
    },
    ygNodeRemoveChild: {
      args: ["ptr", "ptr"],
      returns: "void",
    },
    ygNodeRemoveAllChildren: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeGetChild: {
      args: ["ptr", "u64"],
      returns: "ptr",
    },
    ygNodeGetChildCount: {
      args: ["ptr"],
      returns: "u64",
    },
    ygNodeGetParent: {
      args: ["ptr"],
      returns: "ptr",
    },

    // Layout calculation
    ygNodeCalculateLayout: {
      args: ["ptr", "f32", "f32", "i32"],
      returns: "void",
    },
    ygNodeGetHasNewLayout: {
      args: ["ptr"],
      returns: "bool",
    },
    ygNodeSetHasNewLayout: {
      args: ["ptr", "bool"],
      returns: "void",
    },
    ygNodeMarkDirty: {
      args: ["ptr"],
      returns: "void",
    },

    // Layout result access
    ygNodeLayoutGetLeft: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeLayoutGetTop: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeLayoutGetRight: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeLayoutGetBottom: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeLayoutGetWidth: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeLayoutGetHeight: {
      args: ["ptr"],
      returns: "f32",
    },

    // Style properties - Layout
    ygNodeStyleSetDirection: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetDirection: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetFlexDirection: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetFlexDirection: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetJustifyContent: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetJustifyContent: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetAlignContent: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetAlignContent: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetAlignItems: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetAlignItems: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetAlignSelf: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetAlignSelf: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetPositionType: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetPositionType: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetFlexWrap: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetFlexWrap: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetOverflow: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetOverflow: {
      args: ["ptr"],
      returns: "i32",
    },
    ygNodeStyleSetDisplay: {
      args: ["ptr", "i32"],
      returns: "void",
    },
    ygNodeStyleGetDisplay: {
      args: ["ptr"],
      returns: "i32",
    },

    // Style properties - Flex
    ygNodeStyleSetFlex: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleGetFlex: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeStyleSetFlexGrow: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleGetFlexGrow: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeStyleSetFlexShrink: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleGetFlexShrink: {
      args: ["ptr"],
      returns: "f32",
    },
    ygNodeStyleSetFlexBasis: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetFlexBasisPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetFlexBasisAuto: {
      args: ["ptr"],
      returns: "void",
    },

    // Style properties - Position
    ygNodeStyleSetPosition: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },
    ygNodeStyleSetPositionPercent: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },
    ygNodeStyleSetPositionAuto: {
      args: ["ptr", "i32"],
      returns: "void",
    },

    // Style properties - Margin
    ygNodeStyleSetMargin: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMarginPercent: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMarginAuto: {
      args: ["ptr", "i32"],
      returns: "void",
    },

    // Style properties - Padding
    ygNodeStyleSetPadding: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },
    ygNodeStyleSetPaddingPercent: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },

    // Style properties - Border
    ygNodeStyleSetBorder: {
      args: ["ptr", "i32", "f32"],
      returns: "void",
    },
    ygNodeStyleGetBorder: {
      args: ["ptr", "i32"],
      returns: "f32",
    },

    // Style properties - Size
    ygNodeStyleSetWidth: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetWidthPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetWidthAuto: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeStyleSetHeight: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetHeightPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetHeightAuto: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeStyleSetMinWidth: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMinWidthPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMinHeight: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMinHeightPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMaxWidth: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMaxWidthPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMaxHeight: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleSetMaxHeightPercent: {
      args: ["ptr", "f32"],
      returns: "void",
    },

    // Style properties - Aspect Ratio
    ygNodeStyleSetAspectRatio: {
      args: ["ptr", "f32"],
      returns: "void",
    },
    ygNodeStyleGetAspectRatio: {
      args: ["ptr"],
      returns: "f32",
    },

    // Node configuration
    ygNodeSetContext: {
      args: ["ptr", "ptr"],
      returns: "void",
    },
    ygNodeGetContext: {
      args: ["ptr"],
      returns: "ptr",
    },

    // Callback functions
    ygNodeSetMeasureFunc: {
      args: ["ptr", "ptr"],
      returns: "void",
    },
    ygNodeUnsetMeasureFunc: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeHasMeasureFunc: {
      args: ["ptr"],
      returns: "bool",
    },
    ygNodeSetBaselineFunc: {
      args: ["ptr", "ptr"],
      returns: "void",
    },
    ygNodeUnsetBaselineFunc: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeHasBaselineFunc: {
      args: ["ptr"],
      returns: "bool",
    },
    ygNodeSetDirtiedFunc: {
      args: ["ptr", "ptr"],
      returns: "void",
    },
    ygNodeUnsetDirtiedFunc: {
      args: ["ptr"],
      returns: "void",
    },
    ygNodeGetDirtiedFunc: {
      args: ["ptr"],
      returns: "ptr",
    },

    // Callback helper functions
    ygCreateSize: {
      args: ["f32", "f32"],
      returns: "ptr", // Returns YGSize struct as pointer
    },

    // Layout result functions (these exist in Yoga)
    ygNodeLayoutGetBorder: {
      args: ["ptr", "i32"],
      returns: "f32",
    },
    ygNodeLayoutGetMargin: {
      args: ["ptr", "i32"],
      returns: "f32",
    },
    ygNodeLayoutGetPadding: {
      args: ["ptr", "i32"],
      returns: "f32",
    },
  });
}

// Create enum values object using imported enums
const enumValues = {
  // Direction
  DirectionInherit: Direction.Inherit,
  DirectionLTR: Direction.LTR,
  DirectionRTL: Direction.RTL,

  // FlexDirection
  FlexDirectionColumn: FlexDirection.Column,
  FlexDirectionColumnReverse: FlexDirection.ColumnReverse,
  FlexDirectionRow: FlexDirection.Row,
  FlexDirectionRowReverse: FlexDirection.RowReverse,

  // Justify
  JustifyFlexStart: Justify.FlexStart,
  JustifyCenter: Justify.Center,
  JustifyFlexEnd: Justify.FlexEnd,
  JustifySpaceBetween: Justify.SpaceBetween,
  JustifySpaceAround: Justify.SpaceAround,
  JustifySpaceEvenly: Justify.SpaceEvenly,

  // Align
  AlignAuto: Align.Auto,
  AlignFlexStart: Align.FlexStart,
  AlignCenter: Align.Center,
  AlignFlexEnd: Align.FlexEnd,
  AlignStretch: Align.Stretch,
  AlignBaseline: Align.Baseline,
  AlignSpaceBetween: Align.SpaceBetween,
  AlignSpaceAround: Align.SpaceAround,
  AlignSpaceEvenly: Align.SpaceEvenly,

  // PositionType
  PositionTypeStatic: PositionType.Static,
  PositionTypeRelative: PositionType.Relative,
  PositionTypeAbsolute: PositionType.Absolute,

  // Wrap
  WrapNoWrap: Wrap.NoWrap,
  WrapWrap: Wrap.Wrap,
  WrapWrapReverse: Wrap.WrapReverse,

  // Overflow
  OverflowVisible: Overflow.Visible,
  OverflowHidden: Overflow.Hidden,
  OverflowScroll: Overflow.Scroll,

  // Display
  DisplayFlex: Display.Flex,
  DisplayNone: Display.None,
  DisplayContents: Display.Contents,

  // Edge
  EdgeLeft: Edge.Left,
  EdgeTop: Edge.Top,
  EdgeRight: Edge.Right,
  EdgeBottom: Edge.Bottom,
  EdgeStart: Edge.Start,
  EdgeEnd: Edge.End,
  EdgeHorizontal: Edge.Horizontal,
  EdgeVertical: Edge.Vertical,
  EdgeAll: Edge.All,

  // Additional enums that might be useful
  // BoxSizing
  BoxSizingBorderBox: BoxSizing.BorderBox,
  BoxSizingContentBox: BoxSizing.ContentBox,

  // Dimension
  DimensionWidth: Dimension.Width,
  DimensionHeight: Dimension.Height,

  // Errata
  ErrataNone: Errata.None,
  ErrataStretchFlexBasis: Errata.StretchFlexBasis,
  ErrataAbsolutePositionWithoutInsetsExcludesPadding:
    Errata.AbsolutePositionWithoutInsetsExcludesPadding,
  ErrataAbsolutePercentAgainstInnerSize: Errata.AbsolutePercentAgainstInnerSize,
  ErrataAll: Errata.All,
  ErrataClassic: Errata.Classic,

  // ExperimentalFeature
  ExperimentalFeatureWebFlexBasis: ExperimentalFeature.WebFlexBasis,

  // Gutter
  GutterColumn: Gutter.Column,
  GutterRow: Gutter.Row,
  GutterAll: Gutter.All,

  // LogLevel
  LogLevelError: LogLevel.Error,
  LogLevelWarn: LogLevel.Warn,
  LogLevelInfo: LogLevel.Info,
  LogLevelDebug: LogLevel.Debug,
  LogLevelVerbose: LogLevel.Verbose,
  LogLevelFatal: LogLevel.Fatal,

  // MeasureMode
  MeasureModeUndefined: MeasureMode.Undefined,
  MeasureModeExactly: MeasureMode.Exactly,
  MeasureModeAtMost: MeasureMode.AtMost,

  // NodeType
  NodeTypeDefault: NodeType.Default,
  NodeTypeText: NodeType.Text,

  // Unit
  UnitUndefined: Unit.Undefined,
  UnitPoint: Unit.Point,
  UnitPercent: Unit.Percent,
  UnitAuto: Unit.Auto,
};

// High-level TypeScript interface
export interface YogaNode {
  // Node management
  free(): void;
  freeRecursive(): void;
  reset(): void;
  clone(): YogaNode;

  // Hierarchy
  insertChild(child: YogaNode, index: number): void;
  removeChild(child: YogaNode): void;
  removeAllChildren(): void;
  getChild(index: number): YogaNode | null;
  getChildCount(): number;
  getParent(): YogaNode | null;

  // Layout
  calculateLayout(
    availableWidth?: number,
    availableHeight?: number,
    direction?: number
  ): void;
  getHasNewLayout(): boolean;
  setHasNewLayout(hasNewLayout: boolean): void;
  markDirty(): void;

  // Layout results
  getComputedLeft(): number;
  getComputedTop(): number;
  getComputedRight(): number;
  getComputedBottom(): number;
  getComputedWidth(): number;
  getComputedHeight(): number;

  // Style - Layout
  setDirection(direction: number): void;
  getDirection(): number;
  setFlexDirection(flexDirection: number): void;
  getFlexDirection(): number;
  setJustifyContent(justifyContent: number): void;
  getJustifyContent(): number;
  setAlignContent(alignContent: number): void;
  getAlignContent(): number;
  setAlignItems(alignItems: number): void;
  getAlignItems(): number;
  setAlignSelf(alignSelf: number): void;
  getAlignSelf(): number;
  setPositionType(positionType: number): void;
  getPositionType(): number;
  setFlexWrap(flexWrap: number): void;
  getFlexWrap(): number;
  setOverflow(overflow: number): void;
  getOverflow(): number;
  setDisplay(display: number): void;
  getDisplay(): number;

  // Style - Flex
  setFlex(flex: number): void;
  getFlex(): number;
  setFlexGrow(flexGrow: number): void;
  getFlexGrow(): number;
  setFlexShrink(flexShrink: number): void;
  getFlexShrink(): number;
  setFlexBasis(flexBasis: number): void;
  setFlexBasisPercent(flexBasis: number): void;
  setFlexBasisAuto(): void;

  // Style - Position
  setPosition(edge: number, position: number): void;
  setPositionPercent(edge: number, position: number): void;
  setPositionAuto(edge: number): void;

  // Style - Margin
  setMargin(edge: number, margin: number): void;
  setMarginPercent(edge: number, margin: number): void;
  setMarginAuto(edge: number): void;

  // Style - Padding
  setPadding(edge: number, padding: number): void;
  setPaddingPercent(edge: number, padding: number): void;

  // Style - Border
  setBorder(edge: number, border: number): void;
  getBorder(edge: number): number;

  // Style - Size
  setWidth(width: number): void;
  setWidthPercent(width: number): void;
  setWidthAuto(): void;
  setHeight(height: number): void;
  setHeightPercent(height: number): void;
  setHeightAuto(): void;
  setMinWidth(minWidth: number): void;
  setMinWidthPercent(minWidth: number): void;
  setMinHeight(minHeight: number): void;
  setMinHeightPercent(minHeight: number): void;
  setMaxWidth(maxWidth: number): void;
  setMaxWidthPercent(maxWidth: number): void;
  setMaxHeight(maxHeight: number): void;
  setMaxHeightPercent(maxHeight: number): void;

  // Style - Aspect Ratio
  setAspectRatio(aspectRatio: number): void;
  getAspectRatio(): number;

  // Context
  setContext(context: any): void;
  getContext(): any;

  // Callback functions
  setMeasureFunc(measureFunc: MeasureFunction | null): void;
  unsetMeasureFunc(): void;
  hasMeasureFunc(): boolean;
  setBaselineFunc(baselineFunc: BaselineFunction | null): void;
  unsetBaselineFunc(): void;
  hasBaselineFunc(): boolean;
  setDirtiedFunc(dirtiedFunc: DirtiedFunction | null): void;
  unsetDirtiedFunc(): void;
  getDirtiedFunc(): DirtiedFunction | null;
}

export interface YogaConfig {
  free(): void;
  setUseWebDefaults(useWebDefaults: boolean): void;
  getUseWebDefaults(): boolean;
  setPointScaleFactor(pointScaleFactor: number): void;
  getPointScaleFactor(): number;
}

// Callback function types
export type MeasureFunction = (
  width: number,
  widthMode: number,
  height: number,
  heightMode: number
) => { width: number; height: number };
export type BaselineFunction = (width: number, height: number) => number;
export type DirtiedFunction = () => void;

class YogaNodeImpl implements YogaNode {
  private yoga: ReturnType<typeof getYogaLib>;
  private nodePtr: Pointer;
  private contextMap: WeakMap<Pointer, any> = new WeakMap();
  private measureCallback: JSCallback | null = null;
  private baselineCallback: JSCallback | null = null;
  private dirtiedCallback: JSCallback | null = null;

  constructor(yoga: ReturnType<typeof getYogaLib>, nodePtr: Pointer) {
    this.yoga = yoga;
    this.nodePtr = nodePtr;
  }

  // Node management
  free(): void {
    // Clean up callbacks before freeing the node
    this.unsetMeasureFunc();
    this.unsetBaselineFunc();
    this.unsetDirtiedFunc();
    this.yoga.symbols.ygNodeFree(this.nodePtr);
  }

  freeRecursive(): void {
    this.yoga.symbols.ygNodeFreeRecursive(this.nodePtr);
  }

  reset(): void {
    this.yoga.symbols.ygNodeReset(this.nodePtr);
  }

  clone(): YogaNode {
    const clonedPtr = this.yoga.symbols.ygNodeClone(this.nodePtr);
    if (!clonedPtr) throw new Error("Failed to clone node");
    return new YogaNodeImpl(this.yoga, clonedPtr);
  }

  // Hierarchy
  insertChild(child: YogaNode, index: number): void {
    const childImpl = child as YogaNodeImpl;
    this.yoga.symbols.ygNodeInsertChild(this.nodePtr, childImpl.nodePtr, index);
  }

  removeChild(child: YogaNode): void {
    const childImpl = child as YogaNodeImpl;
    this.yoga.symbols.ygNodeRemoveChild(this.nodePtr, childImpl.nodePtr);
  }

  removeAllChildren(): void {
    this.yoga.symbols.ygNodeRemoveAllChildren(this.nodePtr);
  }

  getChild(index: number): YogaNode | null {
    const childPtr = this.yoga.symbols.ygNodeGetChild(this.nodePtr, index);
    if (!childPtr) return null;
    return new YogaNodeImpl(this.yoga, childPtr);
  }

  getChildCount(): number {
    return Number(this.yoga.symbols.ygNodeGetChildCount(this.nodePtr));
  }

  getParent(): YogaNode | null {
    const parentPtr = this.yoga.symbols.ygNodeGetParent(this.nodePtr);
    return parentPtr ? new YogaNodeImpl(this.yoga, parentPtr) : null;
  }

  // Layout
  calculateLayout(
    availableWidth: number = 0,
    availableHeight: number = 0,
    direction: number = 0
  ): void {
    this.yoga.symbols.ygNodeCalculateLayout(
      this.nodePtr,
      availableWidth,
      availableHeight,
      direction
    );
  }

  getHasNewLayout(): boolean {
    return this.yoga.symbols.ygNodeGetHasNewLayout(this.nodePtr);
  }

  setHasNewLayout(hasNewLayout: boolean): void {
    this.yoga.symbols.ygNodeSetHasNewLayout(this.nodePtr, hasNewLayout);
  }

  markDirty(): void {
    this.yoga.symbols.ygNodeMarkDirty(this.nodePtr);
  }

  // Layout results
  getComputedLeft(): number {
    return this.yoga.symbols.ygNodeLayoutGetLeft(this.nodePtr);
  }

  getComputedTop(): number {
    return this.yoga.symbols.ygNodeLayoutGetTop(this.nodePtr);
  }

  getComputedRight(): number {
    return this.yoga.symbols.ygNodeLayoutGetRight(this.nodePtr);
  }

  getComputedBottom(): number {
    return this.yoga.symbols.ygNodeLayoutGetBottom(this.nodePtr);
  }

  getComputedWidth(): number {
    return this.yoga.symbols.ygNodeLayoutGetWidth(this.nodePtr);
  }

  getComputedHeight(): number {
    return this.yoga.symbols.ygNodeLayoutGetHeight(this.nodePtr);
  }

  // Style - Layout
  setDirection(direction: number): void {
    this.yoga.symbols.ygNodeStyleSetDirection(this.nodePtr, direction);
  }

  getDirection(): number {
    return this.yoga.symbols.ygNodeStyleGetDirection(this.nodePtr);
  }

  setFlexDirection(flexDirection: number): void {
    this.yoga.symbols.ygNodeStyleSetFlexDirection(this.nodePtr, flexDirection);
  }

  getFlexDirection(): number {
    return this.yoga.symbols.ygNodeStyleGetFlexDirection(this.nodePtr);
  }

  setJustifyContent(justifyContent: number): void {
    this.yoga.symbols.ygNodeStyleSetJustifyContent(
      this.nodePtr,
      justifyContent
    );
  }

  getJustifyContent(): number {
    return this.yoga.symbols.ygNodeStyleGetJustifyContent(this.nodePtr);
  }

  setAlignContent(alignContent: number): void {
    this.yoga.symbols.ygNodeStyleSetAlignContent(this.nodePtr, alignContent);
  }

  getAlignContent(): number {
    return this.yoga.symbols.ygNodeStyleGetAlignContent(this.nodePtr);
  }

  setAlignItems(alignItems: number): void {
    this.yoga.symbols.ygNodeStyleSetAlignItems(this.nodePtr, alignItems);
  }

  getAlignItems(): number {
    return this.yoga.symbols.ygNodeStyleGetAlignItems(this.nodePtr);
  }

  setAlignSelf(alignSelf: number): void {
    this.yoga.symbols.ygNodeStyleSetAlignSelf(this.nodePtr, alignSelf);
  }

  getAlignSelf(): number {
    return this.yoga.symbols.ygNodeStyleGetAlignSelf(this.nodePtr);
  }

  setPositionType(positionType: number): void {
    this.yoga.symbols.ygNodeStyleSetPositionType(this.nodePtr, positionType);
  }

  getPositionType(): number {
    return this.yoga.symbols.ygNodeStyleGetPositionType(this.nodePtr);
  }

  setFlexWrap(flexWrap: number): void {
    this.yoga.symbols.ygNodeStyleSetFlexWrap(this.nodePtr, flexWrap);
  }

  getFlexWrap(): number {
    return this.yoga.symbols.ygNodeStyleGetFlexWrap(this.nodePtr);
  }

  setOverflow(overflow: number): void {
    this.yoga.symbols.ygNodeStyleSetOverflow(this.nodePtr, overflow);
  }

  getOverflow(): number {
    return this.yoga.symbols.ygNodeStyleGetOverflow(this.nodePtr);
  }

  setDisplay(display: number): void {
    this.yoga.symbols.ygNodeStyleSetDisplay(this.nodePtr, display);
  }

  getDisplay(): number {
    return this.yoga.symbols.ygNodeStyleGetDisplay(this.nodePtr);
  }

  // Style - Flex
  setFlex(flex: number): void {
    this.yoga.symbols.ygNodeStyleSetFlex(this.nodePtr, flex);
  }

  getFlex(): number {
    return this.yoga.symbols.ygNodeStyleGetFlex(this.nodePtr);
  }

  setFlexGrow(flexGrow: number): void {
    this.yoga.symbols.ygNodeStyleSetFlexGrow(this.nodePtr, flexGrow);
  }

  getFlexGrow(): number {
    return this.yoga.symbols.ygNodeStyleGetFlexGrow(this.nodePtr);
  }

  setFlexShrink(flexShrink: number): void {
    this.yoga.symbols.ygNodeStyleSetFlexShrink(this.nodePtr, flexShrink);
  }

  getFlexShrink(): number {
    return this.yoga.symbols.ygNodeStyleGetFlexShrink(this.nodePtr);
  }

  setFlexBasis(flexBasis: number): void {
    this.yoga.symbols.ygNodeStyleSetFlexBasis(this.nodePtr, flexBasis);
  }

  setFlexBasisPercent(flexBasis: number): void {
    this.yoga.symbols.ygNodeStyleSetFlexBasisPercent(this.nodePtr, flexBasis);
  }

  setFlexBasisAuto(): void {
    this.yoga.symbols.ygNodeStyleSetFlexBasisAuto(this.nodePtr);
  }

  // Style - Position
  setPosition(edge: number, position: number): void {
    this.yoga.symbols.ygNodeStyleSetPosition(this.nodePtr, edge, position);
  }

  setPositionPercent(edge: number, position: number): void {
    this.yoga.symbols.ygNodeStyleSetPositionPercent(
      this.nodePtr,
      edge,
      position
    );
  }

  setPositionAuto(edge: number): void {
    this.yoga.symbols.ygNodeStyleSetPositionAuto(this.nodePtr, edge);
  }

  // Style - Margin
  setMargin(edge: number, margin: number): void {
    this.yoga.symbols.ygNodeStyleSetMargin(this.nodePtr, edge, margin);
  }

  setMarginPercent(edge: number, margin: number): void {
    this.yoga.symbols.ygNodeStyleSetMarginPercent(this.nodePtr, edge, margin);
  }

  setMarginAuto(edge: number): void {
    this.yoga.symbols.ygNodeStyleSetMarginAuto(this.nodePtr, edge);
  }

  // Style - Padding
  setPadding(edge: number, padding: number): void {
    this.yoga.symbols.ygNodeStyleSetPadding(this.nodePtr, edge, padding);
  }

  setPaddingPercent(edge: number, padding: number): void {
    this.yoga.symbols.ygNodeStyleSetPaddingPercent(this.nodePtr, edge, padding);
  }

  // Style - Border
  setBorder(edge: number, border: number): void {
    this.yoga.symbols.ygNodeStyleSetBorder(this.nodePtr, edge, border);
  }

  getBorder(edge: number): number {
    return this.yoga.symbols.ygNodeStyleGetBorder(this.nodePtr, edge);
  }

  // Style - Size
  setWidth(width: number): void {
    this.yoga.symbols.ygNodeStyleSetWidth(this.nodePtr, width);
  }

  setWidthPercent(width: number): void {
    this.yoga.symbols.ygNodeStyleSetWidthPercent(this.nodePtr, width);
  }

  setWidthAuto(): void {
    this.yoga.symbols.ygNodeStyleSetWidthAuto(this.nodePtr);
  }

  setHeight(height: number): void {
    this.yoga.symbols.ygNodeStyleSetHeight(this.nodePtr, height);
  }

  setHeightPercent(height: number): void {
    this.yoga.symbols.ygNodeStyleSetHeightPercent(this.nodePtr, height);
  }

  setHeightAuto(): void {
    this.yoga.symbols.ygNodeStyleSetHeightAuto(this.nodePtr);
  }

  setMinWidth(minWidth: number): void {
    this.yoga.symbols.ygNodeStyleSetMinWidth(this.nodePtr, minWidth);
  }

  setMinWidthPercent(minWidth: number): void {
    this.yoga.symbols.ygNodeStyleSetMinWidthPercent(this.nodePtr, minWidth);
  }

  setMinHeight(minHeight: number): void {
    this.yoga.symbols.ygNodeStyleSetMinHeight(this.nodePtr, minHeight);
  }

  setMinHeightPercent(minHeight: number): void {
    this.yoga.symbols.ygNodeStyleSetMinHeightPercent(this.nodePtr, minHeight);
  }

  setMaxWidth(maxWidth: number): void {
    this.yoga.symbols.ygNodeStyleSetMaxWidth(this.nodePtr, maxWidth);
  }

  setMaxWidthPercent(maxWidth: number): void {
    this.yoga.symbols.ygNodeStyleSetMaxWidthPercent(this.nodePtr, maxWidth);
  }

  setMaxHeight(maxHeight: number): void {
    this.yoga.symbols.ygNodeStyleSetMaxHeight(this.nodePtr, maxHeight);
  }

  setMaxHeightPercent(maxHeight: number): void {
    this.yoga.symbols.ygNodeStyleSetMaxHeightPercent(this.nodePtr, maxHeight);
  }

  // Style - Aspect Ratio
  setAspectRatio(aspectRatio: number): void {
    this.yoga.symbols.ygNodeStyleSetAspectRatio(this.nodePtr, aspectRatio);
  }

  getAspectRatio(): number {
    return this.yoga.symbols.ygNodeStyleGetAspectRatio(this.nodePtr);
  }

  // Context
  setContext(context: any): void {
    this.contextMap.set(this.nodePtr, context);
    this.yoga.symbols.ygNodeSetContext(this.nodePtr, this.nodePtr); // Use node pointer as context key
  }

  getContext(): any {
    return this.contextMap.get(this.nodePtr);
  }

  // Callback functions
  setMeasureFunc(measureFunc: MeasureFunction | null): void {
    this.unsetMeasureFunc(); // Clean up existing callback

    if (measureFunc) {
      // Create a single JSCallback that matches Yoga's expected measure function signature
      this.measureCallback = new JSCallback(
        (
          nodePtr: Pointer,
          width: number,
          widthMode: number,
          height: number,
          heightMode: number
        ) => {
          const result = measureFunc(width, widthMode, height, heightMode);
          // Use the helper function to create a proper YGSize struct
          return this.yoga.symbols.ygCreateSize(result.width, result.height);
        },
        {
          args: [
            FFIType.ptr,
            FFIType.f32,
            FFIType.u32,
            FFIType.f32,
            FFIType.u32,
          ],
          returns: FFIType.ptr, // Returns YGSize struct as pointer
        }
      );

      if (this.measureCallback.ptr) {
        this.yoga.symbols.ygNodeSetMeasureFunc(
          this.nodePtr,
          this.measureCallback.ptr
        );
      }
    }
  }

  unsetMeasureFunc(): void {
    if (this.measureCallback) {
      this.measureCallback.close();
      this.measureCallback = null;
    }
    this.yoga.symbols.ygNodeUnsetMeasureFunc(this.nodePtr);
  }

  hasMeasureFunc(): boolean {
    return this.yoga.symbols.ygNodeHasMeasureFunc(this.nodePtr);
  }

  setBaselineFunc(baselineFunc: BaselineFunction | null): void {
    this.unsetBaselineFunc(); // Clean up existing callback

    if (baselineFunc) {
      // Create a JSCallback that matches Yoga's expected baseline function signature
      this.baselineCallback = new JSCallback(
        (nodePtr: Pointer, width: number, height: number) => {
          return baselineFunc(width, height);
        },
        {
          args: [FFIType.ptr, FFIType.f32, FFIType.f32],
          returns: FFIType.f32,
        }
      );

      if (this.baselineCallback.ptr) {
        this.yoga.symbols.ygNodeSetBaselineFunc(
          this.nodePtr,
          this.baselineCallback.ptr
        );
      }
    }
  }

  unsetBaselineFunc(): void {
    if (this.baselineCallback) {
      this.baselineCallback.close();
      this.baselineCallback = null;
    }
    this.yoga.symbols.ygNodeUnsetBaselineFunc(this.nodePtr);
  }

  hasBaselineFunc(): boolean {
    return this.yoga.symbols.ygNodeHasBaselineFunc(this.nodePtr);
  }

  setDirtiedFunc(dirtiedFunc: DirtiedFunction | null): void {
    this.unsetDirtiedFunc(); // Clean up existing callback

    if (dirtiedFunc) {
      // Create a JSCallback that matches Yoga's expected dirtied function signature
      this.dirtiedCallback = new JSCallback(
        (nodePtr: Pointer) => {
          dirtiedFunc();
        },
        {
          args: [FFIType.ptr],
          returns: FFIType.void,
        }
      );

      if (this.dirtiedCallback.ptr) {
        this.yoga.symbols.ygNodeSetDirtiedFunc(
          this.nodePtr,
          this.dirtiedCallback.ptr
        );
      }
    }
  }

  unsetDirtiedFunc(): void {
    if (this.dirtiedCallback) {
      this.dirtiedCallback.close();
      this.dirtiedCallback = null;
    }
    this.yoga.symbols.ygNodeUnsetDirtiedFunc(this.nodePtr);
  }

  getDirtiedFunc(): DirtiedFunction | null {
    // We can't retrieve the actual function from FFI, but we can check if we have one stored
    return this.dirtiedCallback ? () => {} : null;
  }
}

class YogaConfigImpl implements YogaConfig {
  private yoga: ReturnType<typeof getYogaLib>;
  public configPtr: Pointer;

  constructor(yoga: ReturnType<typeof getYogaLib>, configPtr: Pointer) {
    this.yoga = yoga;
    this.configPtr = configPtr;
  }

  free(): void {
    this.yoga.symbols.ygConfigFree(this.configPtr);
  }

  setUseWebDefaults(useWebDefaults: boolean): void {
    this.yoga.symbols.ygConfigSetUseWebDefaults(this.configPtr, useWebDefaults);
  }

  getUseWebDefaults(): boolean {
    return this.yoga.symbols.ygConfigGetUseWebDefaults(this.configPtr);
  }

  setPointScaleFactor(pointScaleFactor: number): void {
    this.yoga.symbols.ygConfigSetPointScaleFactor(
      this.configPtr,
      pointScaleFactor
    );
  }

  getPointScaleFactor(): number {
    return this.yoga.symbols.ygConfigGetPointScaleFactor(this.configPtr);
  }
}

export interface YogaLibrary {
  createNode(): YogaNode;
  createNodeWithConfig(config: YogaConfig): YogaNode;
  createConfig(): YogaConfig;
  getDefaultConfig(): YogaConfig;
  enums: Record<string, number>;
}

// Enum types are already exported above as const objects

class YogaLibraryImpl implements YogaLibrary {
  private yoga: ReturnType<typeof getYogaLib>;
  public enums: Record<string, number>;

  constructor(libPath: string) {
    this.yoga = getYogaLib(libPath);
    this.enums = enumValues;
  }

  createNode(): YogaNode {
    const nodePtr = this.yoga.symbols.ygNodeNew();
    if (!nodePtr) throw new Error("Failed to create node");
    return new YogaNodeImpl(this.yoga, nodePtr);
  }

  createNodeWithConfig(config: YogaConfig): YogaNode {
    const configImpl = config as YogaConfigImpl;
    const nodePtr = this.yoga.symbols.ygNodeNewWithConfig(configImpl.configPtr);
    if (!nodePtr) throw new Error("Failed to create node with config");
    return new YogaNodeImpl(this.yoga, nodePtr);
  }

  createConfig(): YogaConfig {
    const configPtr = this.yoga.symbols.ygConfigNew();
    if (!configPtr) throw new Error("Failed to create config");
    return new YogaConfigImpl(this.yoga, configPtr);
  }

  getDefaultConfig(): YogaConfig {
    const configPtr = this.yoga.symbols.ygConfigGetDefault();
    if (!configPtr) throw new Error("Failed to get default config");
    return new YogaConfigImpl(this.yoga, configPtr);
  }
}

let yogaLibPath: string | undefined;
let yogaLib: YogaLibrary | undefined;

export function setYogaLibPath(libPath: string) {
  if (yogaLibPath !== libPath) {
    yogaLibPath = libPath;
    yogaLib = undefined;
  }
}

export function clearYogaLibCache() {
  yogaLib = undefined;
}

export function resolveYogaLib(): YogaLibrary {
  if (!yogaLib) {
    try {
      if (!yogaLibPath) {
        throw new Error(
          "Yoga library path not set. Call setYogaLibPath first."
        );
      }
      yogaLib = new YogaLibraryImpl(yogaLibPath);
    } catch (error) {
      throw new Error(
        `Failed to initialize Yoga library: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  return yogaLib;
}

// Try eager loading only if path is set
if (yogaLibPath) {
  try {
    yogaLib = new YogaLibraryImpl(yogaLibPath);
  } catch (error) {
    // Suppress eager loading errors
  }
}
