import { dlopen, toArrayBuffer, type Pointer } from "bun:ffi";
import { existsSync } from "fs";

const module = await import(
  `@yoga/yoga-${process.platform}-${process.arch}/index.ts`
);
const targetLibPath = module.default;
if (!existsSync(targetLibPath)) {
  throw new Error(
    `@yoga/yoga is not supported on the current platform: ${process.platform}-${process.arch}`
  );
}

function getYogaLib(libPath?: string) {
  const resolvedLibPath = libPath || targetLibPath;

  return dlopen(resolvedLibPath, {
    // Renderer management
    createRenderer: {
      args: ["u32", "u32"],
      returns: "ptr",
    },
    destroyRenderer: {
      args: ["ptr", "bool", "u32"],
      returns: "void",
    },
    // ...
  });
}

export interface RenderLib {
  createRenderer: (width: number, height: number) => Pointer | null;
  destroyRenderer: (
    renderer: Pointer,
    useAlternateScreen: boolean,
    splitHeight: number
  ) => void;
  setUseThread: (renderer: Pointer, useThread: boolean) => void;
  setBackgroundColor: (renderer: Pointer, color: RGBA) => void;
  setRenderOffset: (renderer: Pointer, offset: number) => void;
  updateStats: (
    renderer: Pointer,
    time: number,
    fps: number,
    frameCallbackTime: number
  ) => void;
  updateMemoryStats: (
    renderer: Pointer,
    heapUsed: number,
    heapTotal: number,
    arrayBuffers: number
  ) => void;
  render: (renderer: Pointer, force: boolean) => void;
}

class FFIYogaLib implements RenderLib {
  private yoga: ReturnType<typeof getYogaLib>;
  private encoder: TextEncoder = new TextEncoder();

  constructor(libPath?: string) {
    this.yoga = getYogaLib(libPath);
  }

  public createRenderer(width: number, height: number) {
    return this.yoga.symbols.createRenderer(width, height);
  }

  public destroyRenderer(
    renderer: Pointer,
    useAlternateScreen: boolean,
    splitHeight: number
  ) {
    this.yoga.symbols.destroyRenderer(
      renderer,
      useAlternateScreen,
      splitHeight
    );
  }

  public setUseThread(renderer: Pointer, useThread: boolean) {
    this.yoga.symbols.setUseThread(renderer, useThread);
  }

  public setBackgroundColor(renderer: Pointer, color: RGBA) {
    this.yoga.symbols.setBackgroundColor(renderer, color.buffer);
  }

  public setRenderOffset(renderer: Pointer, offset: number) {
    this.yoga.symbols.setRenderOffset(renderer, offset);
  }

  public updateStats(
    renderer: Pointer,
    time: number,
    fps: number,
    frameCallbackTime: number
  ) {
    this.yoga.symbols.updateStats(renderer, time, fps, frameCallbackTime);
  }

  public updateMemoryStats(
    renderer: Pointer,
    heapUsed: number,
    heapTotal: number,
    arrayBuffers: number
  ) {
    this.yoga.symbols.updateMemoryStats(
      renderer,
      heapUsed,
      heapTotal,
      arrayBuffers
    );
  }

  public getNextBuffer(renderer: Pointer): OptimizedBuffer {
    const bufferPtr = this.yoga.symbols.getNextBuffer(renderer);
    if (!bufferPtr) {
      throw new Error("Failed to get next buffer");
    }

    const width = this.yoga.symbols.getBufferWidth(bufferPtr);
    const height = this.yoga.symbols.getBufferHeight(bufferPtr);
    const size = width * height;
    const buffers = this.getBuffer(bufferPtr, size);

    return new OptimizedBuffer(this, bufferPtr, buffers, width, height, {});
  }

  public getCurrentBuffer(renderer: Pointer): OptimizedBuffer {
    const bufferPtr = this.yoga.symbols.getCurrentBuffer(renderer);
    if (!bufferPtr) {
      throw new Error("Failed to get current buffer");
    }

    const width = this.yoga.symbols.getBufferWidth(bufferPtr);
    const height = this.yoga.symbols.getBufferHeight(bufferPtr);
    const size = width * height;
    const buffers = this.getBuffer(bufferPtr, size);

    return new OptimizedBuffer(this, bufferPtr, buffers, width, height, {});
  }

  private getBuffer(
    bufferPtr: Pointer,
    size: number
  ): {
    char: Uint32Array;
    fg: Float32Array;
    bg: Float32Array;
    attributes: Uint8Array;
  } {
    const charPtr = this.yoga.symbols.bufferGetCharPtr(bufferPtr);
    const fgPtr = this.yoga.symbols.bufferGetFgPtr(bufferPtr);
    const bgPtr = this.yoga.symbols.bufferGetBgPtr(bufferPtr);
    const attributesPtr = this.yoga.symbols.bufferGetAttributesPtr(bufferPtr);

    if (!charPtr || !fgPtr || !bgPtr || !attributesPtr) {
      throw new Error("Failed to get buffer pointers");
    }

    const buffers = {
      char: new Uint32Array(toArrayBuffer(charPtr, 0, size * 4)),
      fg: new Float32Array(toArrayBuffer(fgPtr, 0, size * 4 * 4)), // 4 floats per RGBA
      bg: new Float32Array(toArrayBuffer(bgPtr, 0, size * 4 * 4)), // 4 floats per RGBA
      attributes: new Uint8Array(toArrayBuffer(attributesPtr, 0, size)),
    };

    return buffers;
  }

  // ...
}

let yogaLibPath: string | undefined;
let yogaLib: RenderLib | undefined;

export function setRenderLibPath(libPath: string) {
  if (yogaLibPath !== libPath) {
    yogaLibPath = libPath;
    yogaLib = undefined;
  }
}

export function resolveRenderLib(): RenderLib {
  if (!yogaLib) {
    try {
      yogaLib = new FFIYogaLib(yogaLibPath);
    } catch (error) {
      throw new Error(
        `Failed to initialize bun-yoga library: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  return yogaLib;
}

// Try eager loading
try {
  yogaLib = new FFIYogaLib(yogaLibPath);
} catch (error) {}
