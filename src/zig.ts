import { dlopen, type Pointer } from "bun:ffi";
import { existsSync } from "fs";

// Utility function to get target-specific library path
function getTargetLibPath(): string {
  let platform: string;
  let arch: string;

  switch (process.platform) {
    case "darwin":
      platform = "macos";
      break;
    case "linux":
      platform = "linux";
      break;
    case "win32":
      platform = "windows";
      break;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  switch (process.arch) {
    case "arm64":
      arch = "aarch64";
      break;
    case "x64":
      arch = "x86_64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  const libFileName = process.platform === "win32" ? "yoga.dll" : "libyoga.dylib";
  return `../lib/${arch}-${platform}/${libFileName}`;
}

function getYogaLib(libPath?: string) {
  const resolvedLibPath = libPath || getTargetLibPath();

  if (!existsSync(resolvedLibPath)) {
    throw new Error(
      `Yoga library not found at path: ${resolvedLibPath}. Please build the library first or check the path.`
    );
  }

  return dlopen(resolvedLibPath, {
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

    // Enum value getters
    ygDirectionInherit: { args: [], returns: "i32" },
    ygDirectionLTR: { args: [], returns: "i32" },
    ygDirectionRTL: { args: [], returns: "i32" },
    ygFlexDirectionColumn: { args: [], returns: "i32" },
    ygFlexDirectionColumnReverse: { args: [], returns: "i32" },
    ygFlexDirectionRow: { args: [], returns: "i32" },
    ygFlexDirectionRowReverse: { args: [], returns: "i32" },
    ygJustifyFlexStart: { args: [], returns: "i32" },
    ygJustifyCenter: { args: [], returns: "i32" },
    ygJustifyFlexEnd: { args: [], returns: "i32" },
    ygJustifySpaceBetween: { args: [], returns: "i32" },
    ygJustifySpaceAround: { args: [], returns: "i32" },
    ygJustifySpaceEvenly: { args: [], returns: "i32" },
    ygAlignAuto: { args: [], returns: "i32" },
    ygAlignFlexStart: { args: [], returns: "i32" },
    ygAlignCenter: { args: [], returns: "i32" },
    ygAlignFlexEnd: { args: [], returns: "i32" },
    ygAlignStretch: { args: [], returns: "i32" },
    ygAlignBaseline: { args: [], returns: "i32" },
    ygAlignSpaceBetween: { args: [], returns: "i32" },
    ygAlignSpaceAround: { args: [], returns: "i32" },
    ygAlignSpaceEvenly: { args: [], returns: "i32" },
    ygPositionTypeStatic: { args: [], returns: "i32" },
    ygPositionTypeRelative: { args: [], returns: "i32" },
    ygPositionTypeAbsolute: { args: [], returns: "i32" },
    ygWrapNoWrap: { args: [], returns: "i32" },
    ygWrapWrap: { args: [], returns: "i32" },
    ygWrapWrapReverse: { args: [], returns: "i32" },
    ygOverflowVisible: { args: [], returns: "i32" },
    ygOverflowHidden: { args: [], returns: "i32" },
    ygOverflowScroll: { args: [], returns: "i32" },
    ygDisplayFlex: { args: [], returns: "i32" },
    ygDisplayNone: { args: [], returns: "i32" },
    ygDisplayContents: { args: [], returns: "i32" },
    ygEdgeLeft: { args: [], returns: "i32" },
    ygEdgeTop: { args: [], returns: "i32" },
    ygEdgeRight: { args: [], returns: "i32" },
    ygEdgeBottom: { args: [], returns: "i32" },
    ygEdgeStart: { args: [], returns: "i32" },
    ygEdgeEnd: { args: [], returns: "i32" },
    ygEdgeHorizontal: { args: [], returns: "i32" },
    ygEdgeVertical: { args: [], returns: "i32" },
    ygEdgeAll: { args: [], returns: "i32" },
  });
}

// Yoga enum constants (cached for performance)
let _enumCache: Record<string, number> | null = null;

function getEnumValues(yoga: ReturnType<typeof getYogaLib>) {
  if (_enumCache) return _enumCache;

  _enumCache = {
    // Direction
    DirectionInherit: yoga.symbols.ygDirectionInherit(),
    DirectionLTR: yoga.symbols.ygDirectionLTR(),
    DirectionRTL: yoga.symbols.ygDirectionRTL(),

    // FlexDirection
    FlexDirectionColumn: yoga.symbols.ygFlexDirectionColumn(),
    FlexDirectionColumnReverse: yoga.symbols.ygFlexDirectionColumnReverse(),
    FlexDirectionRow: yoga.symbols.ygFlexDirectionRow(),
    FlexDirectionRowReverse: yoga.symbols.ygFlexDirectionRowReverse(),

    // Justify
    JustifyFlexStart: yoga.symbols.ygJustifyFlexStart(),
    JustifyCenter: yoga.symbols.ygJustifyCenter(),
    JustifyFlexEnd: yoga.symbols.ygJustifyFlexEnd(),
    JustifySpaceBetween: yoga.symbols.ygJustifySpaceBetween(),
    JustifySpaceAround: yoga.symbols.ygJustifySpaceAround(),
    JustifySpaceEvenly: yoga.symbols.ygJustifySpaceEvenly(),

    // Align
    AlignAuto: yoga.symbols.ygAlignAuto(),
    AlignFlexStart: yoga.symbols.ygAlignFlexStart(),
    AlignCenter: yoga.symbols.ygAlignCenter(),
    AlignFlexEnd: yoga.symbols.ygAlignFlexEnd(),
    AlignStretch: yoga.symbols.ygAlignStretch(),
    AlignBaseline: yoga.symbols.ygAlignBaseline(),
    AlignSpaceBetween: yoga.symbols.ygAlignSpaceBetween(),
    AlignSpaceAround: yoga.symbols.ygAlignSpaceAround(),
    AlignSpaceEvenly: yoga.symbols.ygAlignSpaceEvenly(),

    // PositionType
    PositionTypeStatic: yoga.symbols.ygPositionTypeStatic(),
    PositionTypeRelative: yoga.symbols.ygPositionTypeRelative(),
    PositionTypeAbsolute: yoga.symbols.ygPositionTypeAbsolute(),

    // Wrap
    WrapNoWrap: yoga.symbols.ygWrapNoWrap(),
    WrapWrap: yoga.symbols.ygWrapWrap(),
    WrapWrapReverse: yoga.symbols.ygWrapWrapReverse(),

    // Overflow
    OverflowVisible: yoga.symbols.ygOverflowVisible(),
    OverflowHidden: yoga.symbols.ygOverflowHidden(),
    OverflowScroll: yoga.symbols.ygOverflowScroll(),

    // Display
    DisplayFlex: yoga.symbols.ygDisplayFlex(),
    DisplayNone: yoga.symbols.ygDisplayNone(),
    DisplayContents: yoga.symbols.ygDisplayContents(),

    // Edge
    EdgeLeft: yoga.symbols.ygEdgeLeft(),
    EdgeTop: yoga.symbols.ygEdgeTop(),
    EdgeRight: yoga.symbols.ygEdgeRight(),
    EdgeBottom: yoga.symbols.ygEdgeBottom(),
    EdgeStart: yoga.symbols.ygEdgeStart(),
    EdgeEnd: yoga.symbols.ygEdgeEnd(),
    EdgeHorizontal: yoga.symbols.ygEdgeHorizontal(),
    EdgeVertical: yoga.symbols.ygEdgeVertical(),
    EdgeAll: yoga.symbols.ygEdgeAll(),
  };

  return _enumCache;
}

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
  calculateLayout(availableWidth?: number, availableHeight?: number, direction?: number): void;
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
}

export interface YogaConfig {
  free(): void;
  setUseWebDefaults(useWebDefaults: boolean): void;
  getUseWebDefaults(): boolean;
  setPointScaleFactor(pointScaleFactor: number): void;
  getPointScaleFactor(): number;
}

class YogaNodeImpl implements YogaNode {
  private yoga: ReturnType<typeof getYogaLib>;
  private nodePtr: Pointer;
  private contextMap: WeakMap<Pointer, any> = new WeakMap();

  constructor(yoga: ReturnType<typeof getYogaLib>, nodePtr: Pointer) {
    this.yoga = yoga;
    this.nodePtr = nodePtr;
  }

  // Node management
  free(): void {
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
    return new YogaNodeImpl(this.yoga, clonedPtr);
  }

  // Hierarchy
  insertChild(child: YogaNode, index: number): void {
    const childImpl = child as YogaNodeImpl;
    this.yoga.symbols.ygNodeInsertChild(this.nodePtr, childImpl.nodePtr, BigInt(index));
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
    return childPtr ? new YogaNodeImpl(this.yoga, childPtr) : null;
  }

  getChildCount(): number {
    return this.yoga.symbols.ygNodeGetChildCount(this.nodePtr);
  }

  getParent(): YogaNode | null {
    const parentPtr = this.yoga.symbols.ygNodeGetParent(this.nodePtr);
    return parentPtr ? new YogaNodeImpl(this.yoga, parentPtr) : null;
  }

  // Layout
  calculateLayout(availableWidth: number = 0, availableHeight: number = 0, direction: number = 0): void {
    this.yoga.symbols.ygNodeCalculateLayout(this.nodePtr, availableWidth, availableHeight, direction);
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
    this.yoga.symbols.ygNodeStyleSetJustifyContent(this.nodePtr, justifyContent);
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
    this.yoga.symbols.ygNodeStyleSetPositionPercent(this.nodePtr, edge, position);
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
}

class YogaConfigImpl implements YogaConfig {
  private yoga: ReturnType<typeof getYogaLib>;
  private configPtr: Pointer;

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
    this.yoga.symbols.ygConfigSetPointScaleFactor(this.configPtr, pointScaleFactor);
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

class YogaLibraryImpl implements YogaLibrary {
  private yoga: ReturnType<typeof getYogaLib>;
  public enums: Record<string, number>;

  constructor(libPath?: string) {
    this.yoga = getYogaLib(libPath);
    this.enums = getEnumValues(this.yoga);
  }

  createNode(): YogaNode {
    const nodePtr = this.yoga.symbols.ygNodeNew();
    return new YogaNodeImpl(this.yoga, nodePtr);
  }

  createNodeWithConfig(config: YogaConfig): YogaNode {
    const configImpl = config as YogaConfigImpl;
    const nodePtr = this.yoga.symbols.ygNodeNewWithConfig(configImpl.configPtr);
    return new YogaNodeImpl(this.yoga, nodePtr);
  }

  createConfig(): YogaConfig {
    const configPtr = this.yoga.symbols.ygConfigNew();
    return new YogaConfigImpl(this.yoga, configPtr);
  }

  getDefaultConfig(): YogaConfig {
    const configPtr = this.yoga.symbols.ygConfigGetDefault();
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

export function resolveYogaLib(): YogaLibrary {
  if (!yogaLib) {
    try {
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

// Try eager loading
try {
  yogaLib = new YogaLibraryImpl(yogaLibPath);
} catch (error) {
  // Suppress eager loading errors
}