# Build Target Options

This project now supports building for specific platforms and architectures, including native-only builds for development.

## New Build Scripts

### Native-only builds (current system)

- `npm run build:native:current` - Build native binaries for current system (production)
- `npm run build:native:current:dev` - Build native binaries for current system (development)
- `npm run build:current` - Build both native binaries and library for current system (production)
- `npm run build:current:dev` - Build both native binaries and library for current system (development)

### Existing builds (all platforms)

- `npm run build:native` - Build native binaries for all supported platforms (production)
- `npm run build:native:dev` - Build native binaries for all supported platforms (development)
- `npm run build:lib` - Build the library
- `npm run build` - Build everything (all platforms + library)

## Advanced Usage

You can also use the build script directly with additional options:

### Platform/Architecture filtering

```bash
# Build for specific platform
bun run scripts/build.ts --native --platform=linux

# Build for specific architecture
bun run scripts/build.ts --native --arch=arm64

# Build for specific platform and architecture
bun run scripts/build.ts --native --platform=linux --arch=x64

# Build native-only (current system)
bun run scripts/build.ts --native --native-only
```

### Available platforms and architectures

- **Platforms**: `darwin`, `linux`, `win32`
- **Architectures**: `x64`, `arm64`

### CI Usage

For CI environments where you only want to build for a specific target:

```bash
# Build for Linux x64 only
npm run scripts/build.ts --native --platform=linux --arch=x64

# Build for current system only
npm run build:current
```

## Zig Build Options

The underlying Zig build system also supports these options:

```bash
cd src/zig

# Build for current system only
zig build -Dnative-only=true

# Build for specific target
zig build -Dtarget=x86_64-linux

# Build with debug optimization
zig build -Doptimize=Debug -Dnative-only=true
```
