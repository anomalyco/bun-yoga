const std = @import("std");

// Import C headers from Yoga
const c = @cImport({
    @cInclude("Yoga.h");
});

// Re-export all Yoga types and constants for easier access
pub const YGNodeRef = c.YGNodeRef;
pub const YGNodeConstRef = c.YGNodeConstRef;
pub const YGConfigRef = c.YGConfigRef;
pub const YGConfigConstRef = c.YGConfigConstRef;

// Yoga enums
pub const YGAlign = c.YGAlign;
pub const YGBoxSizing = c.YGBoxSizing;
pub const YGDimension = c.YGDimension;
pub const YGDirection = c.YGDirection;
pub const YGDisplay = c.YGDisplay;
pub const YGEdge = c.YGEdge;
pub const YGErrata = c.YGErrata;
pub const YGExperimentalFeature = c.YGExperimentalFeature;
pub const YGFlexDirection = c.YGFlexDirection;
pub const YGGutter = c.YGGutter;
pub const YGJustify = c.YGJustify;
pub const YGLogLevel = c.YGLogLevel;
pub const YGMeasureMode = c.YGMeasureMode;
pub const YGNodeType = c.YGNodeType;
pub const YGOverflow = c.YGOverflow;
pub const YGPositionType = c.YGPositionType;
pub const YGUnit = c.YGUnit;
pub const YGWrap = c.YGWrap;

// Yoga structures
pub const YGSize = c.YGSize;
pub const YGValue = c.YGValue;

// Yoga function pointer types
pub const YGMeasureFunc = c.YGMeasureFunc;
pub const YGBaselineFunc = c.YGBaselineFunc;
pub const YGDirtiedFunc = c.YGDirtiedFunc;

// Constants
pub const YGValueAuto = c.YGValueAuto;
pub const YGValueUndefined = c.YGValueUndefined;
pub const YGValueZero = c.YGValueZero;

//=============================================================================
// CONFIG FUNCTIONS
//=============================================================================

/// Creates a new Yoga configuration
pub export fn ygConfigNew() YGConfigRef {
    return c.YGConfigNew();
}

/// Frees a Yoga configuration
pub export fn ygConfigFree(config: YGConfigRef) void {
    c.YGConfigFree(config);
}

/// Gets the default Yoga configuration
pub export fn ygConfigGetDefault() YGConfigConstRef {
    return c.YGConfigGetDefault();
}

/// Sets whether to use web defaults
pub export fn ygConfigSetUseWebDefaults(config: YGConfigRef, enabled: bool) void {
    c.YGConfigSetUseWebDefaults(config, enabled);
}

/// Gets whether web defaults are enabled
pub export fn ygConfigGetUseWebDefaults(config: YGConfigConstRef) bool {
    return c.YGConfigGetUseWebDefaults(config);
}

/// Sets point scale factor for layout rounding
pub export fn ygConfigSetPointScaleFactor(config: YGConfigRef, pixelsInPoint: f32) void {
    c.YGConfigSetPointScaleFactor(config, pixelsInPoint);
}

/// Gets the current point scale factor
pub export fn ygConfigGetPointScaleFactor(config: YGConfigConstRef) f32 {
    return c.YGConfigGetPointScaleFactor(config);
}

/// Sets errata for balancing W3C conformance vs compatibility
pub export fn ygConfigSetErrata(config: YGConfigRef, errata: YGErrata) void {
    c.YGConfigSetErrata(config, errata);
}

/// Gets current errata settings
pub export fn ygConfigGetErrata(config: YGConfigConstRef) YGErrata {
    return c.YGConfigGetErrata(config);
}

/// Enables or disables an experimental feature
pub export fn ygConfigSetExperimentalFeatureEnabled(config: YGConfigRef, feature: YGExperimentalFeature, enabled: bool) void {
    c.YGConfigSetExperimentalFeatureEnabled(config, feature, enabled);
}

/// Checks if an experimental feature is enabled
pub export fn ygConfigIsExperimentalFeatureEnabled(config: YGConfigConstRef, feature: YGExperimentalFeature) bool {
    return c.YGConfigIsExperimentalFeatureEnabled(config, feature);
}

//=============================================================================
// NODE CREATION AND MANAGEMENT
//=============================================================================

/// Creates a new Yoga node with default configuration
pub export fn ygNodeNew() YGNodeRef {
    return c.YGNodeNew();
}

/// Creates a new Yoga node with custom configuration
pub export fn ygNodeNewWithConfig(config: YGConfigConstRef) YGNodeRef {
    return c.YGNodeNewWithConfig(config);
}

/// Clones an existing Yoga node
pub export fn ygNodeClone(node: YGNodeConstRef) YGNodeRef {
    return c.YGNodeClone(node);
}

/// Frees a Yoga node
pub export fn ygNodeFree(node: YGNodeRef) void {
    c.YGNodeFree(node);
}

/// Frees a Yoga node and all its children recursively
pub export fn ygNodeFreeRecursive(node: YGNodeRef) void {
    c.YGNodeFreeRecursive(node);
}

/// Finalizes a node without disconnecting from owner/children
pub export fn ygNodeFinalize(node: YGNodeRef) void {
    c.YGNodeFinalize(node);
}

/// Resets a node to its default state
pub export fn ygNodeReset(node: YGNodeRef) void {
    c.YGNodeReset(node);
}

//=============================================================================
// NODE HIERARCHY MANAGEMENT
//=============================================================================

/// Inserts a child node at the given index
pub export fn ygNodeInsertChild(node: YGNodeRef, child: YGNodeRef, index: usize) void {
    c.YGNodeInsertChild(node, child, index);
}

/// Swaps a child node at the given index
pub export fn ygNodeSwapChild(node: YGNodeRef, child: YGNodeRef, index: usize) void {
    c.YGNodeSwapChild(node, child, index);
}

/// Removes a child node
pub export fn ygNodeRemoveChild(node: YGNodeRef, child: YGNodeRef) void {
    c.YGNodeRemoveChild(node, child);
}

/// Removes all child nodes
pub export fn ygNodeRemoveAllChildren(node: YGNodeRef) void {
    c.YGNodeRemoveAllChildren(node);
}

/// Sets children according to the given array
pub export fn ygNodeSetChildren(owner: YGNodeRef, children: [*]const YGNodeRef, count: usize) void {
    c.YGNodeSetChildren(owner, children, count);
}

/// Gets a child node at the given index
pub export fn ygNodeGetChild(node: YGNodeRef, index: usize) YGNodeRef {
    return c.YGNodeGetChild(node, index);
}

/// Gets the number of child nodes
pub export fn ygNodeGetChildCount(node: YGNodeConstRef) usize {
    return c.YGNodeGetChildCount(node);
}

/// Gets the owner/parent of a node
pub export fn ygNodeGetOwner(node: YGNodeRef) YGNodeRef {
    return c.YGNodeGetOwner(node);
}

/// Gets the parent of a node
pub export fn ygNodeGetParent(node: YGNodeRef) YGNodeRef {
    return c.YGNodeGetParent(node);
}

//=============================================================================
// LAYOUT CALCULATION
//=============================================================================

/// Calculates the layout of the node tree
pub export fn ygNodeCalculateLayout(node: YGNodeRef, availableWidth: f32, availableHeight: f32, ownerDirection: YGDirection) void {
    c.YGNodeCalculateLayout(node, availableWidth, availableHeight, ownerDirection);
}

/// Checks if the node has new layout
pub export fn ygNodeGetHasNewLayout(node: YGNodeConstRef) bool {
    return c.YGNodeGetHasNewLayout(node);
}

/// Sets whether a node has new layout
pub export fn ygNodeSetHasNewLayout(node: YGNodeRef, hasNewLayout: bool) void {
    c.YGNodeSetHasNewLayout(node, hasNewLayout);
}

/// Checks if the node is dirty
pub export fn ygNodeIsDirty(node: YGNodeConstRef) bool {
    return c.YGNodeIsDirty(node);
}

/// Marks a node as dirty
pub export fn ygNodeMarkDirty(node: YGNodeRef) void {
    c.YGNodeMarkDirty(node);
}

//=============================================================================
// LAYOUT RESULTS ACCESS
//=============================================================================

/// Gets the computed left position
pub export fn ygNodeLayoutGetLeft(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetLeft(node);
}

/// Gets the computed top position
pub export fn ygNodeLayoutGetTop(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetTop(node);
}

/// Gets the computed right position
pub export fn ygNodeLayoutGetRight(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetRight(node);
}

/// Gets the computed bottom position
pub export fn ygNodeLayoutGetBottom(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetBottom(node);
}

/// Gets the computed width
pub export fn ygNodeLayoutGetWidth(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetWidth(node);
}

/// Gets the computed height
pub export fn ygNodeLayoutGetHeight(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetHeight(node);
}

/// Gets the computed direction
pub export fn ygNodeLayoutGetDirection(node: YGNodeConstRef) YGDirection {
    return c.YGNodeLayoutGetDirection(node);
}

/// Checks if layout had overflow
pub export fn ygNodeLayoutGetHadOverflow(node: YGNodeConstRef) bool {
    return c.YGNodeLayoutGetHadOverflow(node);
}

/// Gets computed margin for an edge
pub export fn ygNodeLayoutGetMargin(node: YGNodeConstRef, edge: YGEdge) f32 {
    return c.YGNodeLayoutGetMargin(node, edge);
}

/// Gets computed border for an edge
pub export fn ygNodeLayoutGetBorder(node: YGNodeConstRef, edge: YGEdge) f32 {
    return c.YGNodeLayoutGetBorder(node, edge);
}

/// Gets computed padding for an edge
pub export fn ygNodeLayoutGetPadding(node: YGNodeConstRef, edge: YGEdge) f32 {
    return c.YGNodeLayoutGetPadding(node, edge);
}

/// Gets raw (unrounded) height
pub export fn ygNodeLayoutGetRawHeight(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetRawHeight(node);
}

/// Gets raw (unrounded) width
pub export fn ygNodeLayoutGetRawWidth(node: YGNodeConstRef) f32 {
    return c.YGNodeLayoutGetRawWidth(node);
}

//=============================================================================
// STYLE - LAYOUT PROPERTIES
//=============================================================================

/// Copies style from one node to another
pub export fn ygNodeCopyStyle(dstNode: YGNodeRef, srcNode: YGNodeConstRef) void {
    c.YGNodeCopyStyle(dstNode, srcNode);
}

/// Sets direction
pub export fn ygNodeStyleSetDirection(node: YGNodeRef, direction: YGDirection) void {
    c.YGNodeStyleSetDirection(node, direction);
}

/// Gets direction
pub export fn ygNodeStyleGetDirection(node: YGNodeConstRef) YGDirection {
    return c.YGNodeStyleGetDirection(node);
}

/// Sets flex direction
pub export fn ygNodeStyleSetFlexDirection(node: YGNodeRef, flexDirection: YGFlexDirection) void {
    c.YGNodeStyleSetFlexDirection(node, flexDirection);
}

/// Gets flex direction
pub export fn ygNodeStyleGetFlexDirection(node: YGNodeConstRef) YGFlexDirection {
    return c.YGNodeStyleGetFlexDirection(node);
}

/// Sets justify content
pub export fn ygNodeStyleSetJustifyContent(node: YGNodeRef, justifyContent: YGJustify) void {
    c.YGNodeStyleSetJustifyContent(node, justifyContent);
}

/// Gets justify content
pub export fn ygNodeStyleGetJustifyContent(node: YGNodeConstRef) YGJustify {
    return c.YGNodeStyleGetJustifyContent(node);
}

/// Sets align content
pub export fn ygNodeStyleSetAlignContent(node: YGNodeRef, alignContent: YGAlign) void {
    c.YGNodeStyleSetAlignContent(node, alignContent);
}

/// Gets align content
pub export fn ygNodeStyleGetAlignContent(node: YGNodeConstRef) YGAlign {
    return c.YGNodeStyleGetAlignContent(node);
}

/// Sets align items
pub export fn ygNodeStyleSetAlignItems(node: YGNodeRef, alignItems: YGAlign) void {
    c.YGNodeStyleSetAlignItems(node, alignItems);
}

/// Gets align items
pub export fn ygNodeStyleGetAlignItems(node: YGNodeConstRef) YGAlign {
    return c.YGNodeStyleGetAlignItems(node);
}

/// Sets align self
pub export fn ygNodeStyleSetAlignSelf(node: YGNodeRef, alignSelf: YGAlign) void {
    c.YGNodeStyleSetAlignSelf(node, alignSelf);
}

/// Gets align self
pub export fn ygNodeStyleGetAlignSelf(node: YGNodeConstRef) YGAlign {
    return c.YGNodeStyleGetAlignSelf(node);
}

/// Sets position type
pub export fn ygNodeStyleSetPositionType(node: YGNodeRef, positionType: YGPositionType) void {
    c.YGNodeStyleSetPositionType(node, positionType);
}

/// Gets position type
pub export fn ygNodeStyleGetPositionType(node: YGNodeConstRef) YGPositionType {
    return c.YGNodeStyleGetPositionType(node);
}

/// Sets flex wrap
pub export fn ygNodeStyleSetFlexWrap(node: YGNodeRef, flexWrap: YGWrap) void {
    c.YGNodeStyleSetFlexWrap(node, flexWrap);
}

/// Gets flex wrap
pub export fn ygNodeStyleGetFlexWrap(node: YGNodeConstRef) YGWrap {
    return c.YGNodeStyleGetFlexWrap(node);
}

/// Sets overflow
pub export fn ygNodeStyleSetOverflow(node: YGNodeRef, overflow: YGOverflow) void {
    c.YGNodeStyleSetOverflow(node, overflow);
}

/// Gets overflow
pub export fn ygNodeStyleGetOverflow(node: YGNodeConstRef) YGOverflow {
    return c.YGNodeStyleGetOverflow(node);
}

/// Sets display
pub export fn ygNodeStyleSetDisplay(node: YGNodeRef, display: YGDisplay) void {
    c.YGNodeStyleSetDisplay(node, display);
}

/// Gets display
pub export fn ygNodeStyleGetDisplay(node: YGNodeConstRef) YGDisplay {
    return c.YGNodeStyleGetDisplay(node);
}

//=============================================================================
// STYLE - FLEX PROPERTIES
//=============================================================================

/// Sets flex shorthand
pub export fn ygNodeStyleSetFlex(node: YGNodeRef, flex: f32) void {
    c.YGNodeStyleSetFlex(node, flex);
}

/// Gets flex shorthand
pub export fn ygNodeStyleGetFlex(node: YGNodeConstRef) f32 {
    return c.YGNodeStyleGetFlex(node);
}

/// Sets flex grow
pub export fn ygNodeStyleSetFlexGrow(node: YGNodeRef, flexGrow: f32) void {
    c.YGNodeStyleSetFlexGrow(node, flexGrow);
}

/// Gets flex grow
pub export fn ygNodeStyleGetFlexGrow(node: YGNodeConstRef) f32 {
    return c.YGNodeStyleGetFlexGrow(node);
}

/// Sets flex shrink
pub export fn ygNodeStyleSetFlexShrink(node: YGNodeRef, flexShrink: f32) void {
    c.YGNodeStyleSetFlexShrink(node, flexShrink);
}

/// Gets flex shrink
pub export fn ygNodeStyleGetFlexShrink(node: YGNodeConstRef) f32 {
    return c.YGNodeStyleGetFlexShrink(node);
}

/// Sets flex basis (points)
pub export fn ygNodeStyleSetFlexBasis(node: YGNodeRef, flexBasis: f32) void {
    c.YGNodeStyleSetFlexBasis(node, flexBasis);
}

/// Sets flex basis (percent)
pub export fn ygNodeStyleSetFlexBasisPercent(node: YGNodeRef, flexBasis: f32) void {
    c.YGNodeStyleSetFlexBasisPercent(node, flexBasis);
}

/// Sets flex basis to auto
pub export fn ygNodeStyleSetFlexBasisAuto(node: YGNodeRef) void {
    c.YGNodeStyleSetFlexBasisAuto(node);
}

/// Sets flex basis to max content
pub export fn ygNodeStyleSetFlexBasisMaxContent(node: YGNodeRef) void {
    c.YGNodeStyleSetFlexBasisMaxContent(node);
}

/// Sets flex basis to fit content
pub export fn ygNodeStyleSetFlexBasisFitContent(node: YGNodeRef) void {
    c.YGNodeStyleSetFlexBasisFitContent(node);
}

/// Sets flex basis to stretch
pub export fn ygNodeStyleSetFlexBasisStretch(node: YGNodeRef) void {
    c.YGNodeStyleSetFlexBasisStretch(node);
}

/// Gets flex basis
pub export fn ygNodeStyleGetFlexBasis(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetFlexBasis(node);
}

//=============================================================================
// STYLE - POSITION PROPERTIES
//=============================================================================

/// Sets position (points)
pub export fn ygNodeStyleSetPosition(node: YGNodeRef, edge: YGEdge, position: f32) void {
    c.YGNodeStyleSetPosition(node, edge, position);
}

/// Sets position (percent)
pub export fn ygNodeStyleSetPositionPercent(node: YGNodeRef, edge: YGEdge, position: f32) void {
    c.YGNodeStyleSetPositionPercent(node, edge, position);
}

/// Sets position to auto
pub export fn ygNodeStyleSetPositionAuto(node: YGNodeRef, edge: YGEdge) void {
    c.YGNodeStyleSetPositionAuto(node, edge);
}

/// Gets position
pub export fn ygNodeStyleGetPosition(node: YGNodeConstRef, edge: YGEdge) YGValue {
    return c.YGNodeStyleGetPosition(node, edge);
}

//=============================================================================
// STYLE - MARGIN PROPERTIES
//=============================================================================

/// Sets margin (points)
pub export fn ygNodeStyleSetMargin(node: YGNodeRef, edge: YGEdge, margin: f32) void {
    c.YGNodeStyleSetMargin(node, edge, margin);
}

/// Sets margin (percent)
pub export fn ygNodeStyleSetMarginPercent(node: YGNodeRef, edge: YGEdge, margin: f32) void {
    c.YGNodeStyleSetMarginPercent(node, edge, margin);
}

/// Sets margin to auto
pub export fn ygNodeStyleSetMarginAuto(node: YGNodeRef, edge: YGEdge) void {
    c.YGNodeStyleSetMarginAuto(node, edge);
}

/// Gets margin
pub export fn ygNodeStyleGetMargin(node: YGNodeConstRef, edge: YGEdge) YGValue {
    return c.YGNodeStyleGetMargin(node, edge);
}

//=============================================================================
// STYLE - PADDING PROPERTIES
//=============================================================================

/// Sets padding (points)
pub export fn ygNodeStyleSetPadding(node: YGNodeRef, edge: YGEdge, padding: f32) void {
    c.YGNodeStyleSetPadding(node, edge, padding);
}

/// Sets padding (percent)
pub export fn ygNodeStyleSetPaddingPercent(node: YGNodeRef, edge: YGEdge, padding: f32) void {
    c.YGNodeStyleSetPaddingPercent(node, edge, padding);
}

/// Gets padding
pub export fn ygNodeStyleGetPadding(node: YGNodeConstRef, edge: YGEdge) YGValue {
    return c.YGNodeStyleGetPadding(node, edge);
}

//=============================================================================
// STYLE - BORDER PROPERTIES
//=============================================================================

/// Sets border width
pub export fn ygNodeStyleSetBorder(node: YGNodeRef, edge: YGEdge, border: f32) void {
    c.YGNodeStyleSetBorder(node, edge, border);
}

/// Gets border width
pub export fn ygNodeStyleGetBorder(node: YGNodeConstRef, edge: YGEdge) f32 {
    return c.YGNodeStyleGetBorder(node, edge);
}

//=============================================================================
// STYLE - GAP PROPERTIES
//=============================================================================

/// Sets gap (points)
pub export fn ygNodeStyleSetGap(node: YGNodeRef, gutter: YGGutter, gapLength: f32) void {
    c.YGNodeStyleSetGap(node, gutter, gapLength);
}

/// Sets gap (percent)
pub export fn ygNodeStyleSetGapPercent(node: YGNodeRef, gutter: YGGutter, gapLength: f32) void {
    c.YGNodeStyleSetGapPercent(node, gutter, gapLength);
}

/// Gets gap
pub export fn ygNodeStyleGetGap(node: YGNodeConstRef, gutter: YGGutter) YGValue {
    return c.YGNodeStyleGetGap(node, gutter);
}

//=============================================================================
// STYLE - SIZE PROPERTIES
//=============================================================================

/// Sets width (points)
pub export fn ygNodeStyleSetWidth(node: YGNodeRef, width: f32) void {
    c.YGNodeStyleSetWidth(node, width);
}

/// Sets width (percent)
pub export fn ygNodeStyleSetWidthPercent(node: YGNodeRef, width: f32) void {
    c.YGNodeStyleSetWidthPercent(node, width);
}

/// Sets width to auto
pub export fn ygNodeStyleSetWidthAuto(node: YGNodeRef) void {
    c.YGNodeStyleSetWidthAuto(node);
}

/// Gets width
pub export fn ygNodeStyleGetWidth(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetWidth(node);
}

/// Sets height (points)
pub export fn ygNodeStyleSetHeight(node: YGNodeRef, height: f32) void {
    c.YGNodeStyleSetHeight(node, height);
}

/// Sets height (percent)
pub export fn ygNodeStyleSetHeightPercent(node: YGNodeRef, height: f32) void {
    c.YGNodeStyleSetHeightPercent(node, height);
}

/// Sets height to auto
pub export fn ygNodeStyleSetHeightAuto(node: YGNodeRef) void {
    c.YGNodeStyleSetHeightAuto(node);
}

/// Gets height
pub export fn ygNodeStyleGetHeight(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetHeight(node);
}

/// Sets min width (points)
pub export fn ygNodeStyleSetMinWidth(node: YGNodeRef, minWidth: f32) void {
    c.YGNodeStyleSetMinWidth(node, minWidth);
}

/// Sets min width (percent)
pub export fn ygNodeStyleSetMinWidthPercent(node: YGNodeRef, minWidth: f32) void {
    c.YGNodeStyleSetMinWidthPercent(node, minWidth);
}

/// Gets min width
pub export fn ygNodeStyleGetMinWidth(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetMinWidth(node);
}

/// Sets min height (points)
pub export fn ygNodeStyleSetMinHeight(node: YGNodeRef, minHeight: f32) void {
    c.YGNodeStyleSetMinHeight(node, minHeight);
}

/// Sets min height (percent)
pub export fn ygNodeStyleSetMinHeightPercent(node: YGNodeRef, minHeight: f32) void {
    c.YGNodeStyleSetMinHeightPercent(node, minHeight);
}

/// Gets min height
pub export fn ygNodeStyleGetMinHeight(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetMinHeight(node);
}

/// Sets max width (points)
pub export fn ygNodeStyleSetMaxWidth(node: YGNodeRef, maxWidth: f32) void {
    c.YGNodeStyleSetMaxWidth(node, maxWidth);
}

/// Sets max width (percent)
pub export fn ygNodeStyleSetMaxWidthPercent(node: YGNodeRef, maxWidth: f32) void {
    c.YGNodeStyleSetMaxWidthPercent(node, maxWidth);
}

/// Gets max width
pub export fn ygNodeStyleGetMaxWidth(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetMaxWidth(node);
}

/// Sets max height (points)
pub export fn ygNodeStyleSetMaxHeight(node: YGNodeRef, maxHeight: f32) void {
    c.YGNodeStyleSetMaxHeight(node, maxHeight);
}

/// Sets max height (percent)
pub export fn ygNodeStyleSetMaxHeightPercent(node: YGNodeRef, maxHeight: f32) void {
    c.YGNodeStyleSetMaxHeightPercent(node, maxHeight);
}

/// Gets max height
pub export fn ygNodeStyleGetMaxHeight(node: YGNodeConstRef) YGValue {
    return c.YGNodeStyleGetMaxHeight(node);
}

//=============================================================================
// STYLE - ASPECT RATIO
//=============================================================================

/// Sets aspect ratio
pub export fn ygNodeStyleSetAspectRatio(node: YGNodeRef, aspectRatio: f32) void {
    c.YGNodeStyleSetAspectRatio(node, aspectRatio);
}

/// Gets aspect ratio
pub export fn ygNodeStyleGetAspectRatio(node: YGNodeConstRef) f32 {
    return c.YGNodeStyleGetAspectRatio(node);
}

//=============================================================================
// NODE CONFIGURATION AND CONTEXT
//=============================================================================

/// Sets node configuration
pub export fn ygNodeSetConfig(node: YGNodeRef, config: YGConfigRef) void {
    c.YGNodeSetConfig(node, config);
}

/// Gets node configuration
pub export fn ygNodeGetConfig(node: YGNodeRef) YGConfigConstRef {
    return c.YGNodeGetConfig(node);
}

/// Sets node context (user data)
pub export fn ygNodeSetContext(node: YGNodeRef, context: ?*anyopaque) void {
    c.YGNodeSetContext(node, context);
}

/// Gets node context (user data)
pub export fn ygNodeGetContext(node: YGNodeConstRef) ?*anyopaque {
    return c.YGNodeGetContext(node);
}

/// Sets measure function
pub export fn ygNodeSetMeasureFunc(node: YGNodeRef, measureFunc: ?*const anyopaque) void {
    c.YGNodeSetMeasureFunc(node, @alignCast(@ptrCast(measureFunc)));
}

/// Unsets measure function
pub export fn ygNodeUnsetMeasureFunc(node: YGNodeRef) void {
    c.YGNodeSetMeasureFunc(node, null);
}

/// Checks if node has measure function
pub export fn ygNodeHasMeasureFunc(node: YGNodeConstRef) bool {
    return c.YGNodeHasMeasureFunc(node);
}

/// Sets baseline function
pub export fn ygNodeSetBaselineFunc(node: YGNodeRef, baselineFunc: ?*const anyopaque) void {
    c.YGNodeSetBaselineFunc(node, @alignCast(@ptrCast(baselineFunc)));
}

/// Unsets baseline function
pub export fn ygNodeUnsetBaselineFunc(node: YGNodeRef) void {
    c.YGNodeSetBaselineFunc(node, null);
}

/// Checks if node has baseline function
pub export fn ygNodeHasBaselineFunc(node: YGNodeConstRef) bool {
    return c.YGNodeHasBaselineFunc(node);
}

/// Sets dirtied callback function
pub export fn ygNodeSetDirtiedFunc(node: YGNodeRef, dirtiedFunc: ?*const anyopaque) void {
    c.YGNodeSetDirtiedFunc(node, @alignCast(@ptrCast(dirtiedFunc)));
}

/// Unsets dirtied callback function
pub export fn ygNodeUnsetDirtiedFunc(node: YGNodeRef) void {
    c.YGNodeSetDirtiedFunc(node, null);
}

/// Gets dirtied callback function
pub export fn ygNodeGetDirtiedFunc(node: YGNodeConstRef) ?*const anyopaque {
    return @ptrCast(c.YGNodeGetDirtiedFunc(node));
}

/// Sets node type
pub export fn ygNodeSetNodeType(node: YGNodeRef, nodeType: YGNodeType) void {
    c.YGNodeSetNodeType(node, nodeType);
}

/// Gets node type
pub export fn ygNodeGetNodeType(node: YGNodeConstRef) YGNodeType {
    return c.YGNodeGetNodeType(node);
}

/// Sets whether node is reference baseline
pub export fn ygNodeSetIsReferenceBaseline(node: YGNodeRef, isReferenceBaseline: bool) void {
    c.YGNodeSetIsReferenceBaseline(node, isReferenceBaseline);
}

/// Checks if node is reference baseline
pub export fn ygNodeIsReferenceBaseline(node: YGNodeConstRef) bool {
    return c.YGNodeIsReferenceBaseline(node);
}

/// Sets whether node always forms containing block
pub export fn ygNodeSetAlwaysFormsContainingBlock(node: YGNodeRef, alwaysFormsContainingBlock: bool) void {
    c.YGNodeSetAlwaysFormsContainingBlock(node, alwaysFormsContainingBlock);
}

/// Checks if node always forms containing block
pub export fn ygNodeGetAlwaysFormsContainingBlock(node: YGNodeConstRef) bool {
    return c.YGNodeGetAlwaysFormsContainingBlock(node);
}

//=============================================================================
// CALLBACK HELPER FUNCTIONS
//=============================================================================

/// Helper to create a YGSize struct for measure function results
pub export fn ygCreateSize(width: f32, height: f32) c.YGSize {
    return c.YGSize{ .width = width, .height = height };
}

//=============================================================================
// UTILITY FUNCTIONS
//=============================================================================

/// Checks if a float value is undefined
pub export fn ygFloatIsUndefined(value: f32) bool {
    return c.YGFloatIsUndefined(value);
}

/// Returns the Undefined value
pub export fn ygUndefined() f32 {
    return c.YGUndefined;
}
