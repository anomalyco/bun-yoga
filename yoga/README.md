# Yoga Layout Engine Libraries

Download and manage pre-built Yoga Layout Engine libraries using the provided script.

## Prerequisites

1. **Bun**: Ensure you have BunJS installed. (https://bun.sh)
2. **GitHub CLI (`gh`)**: The script uses the `gh` command-line tool to interact with the GitHub API and download release assets.
   - Install `gh` from [cli.github.com](https://cli.github.com/).
   - Authenticate with GitHub by running: `gh auth login`

## Downloading Libraries

Use `download_artifacts.ts` to automate the downloading and unpacking of pre-built Yoga libraries from GitHub releases.

### How to Run

Navigate to the `yoga/` directory and run the script using Bun:

```bash
bun download_artifacts.ts [options]
```

**Options:**

- **`-o, --owner <owner>`**: Repository owner (default: `kommander`)
- **`-r, --repo <repo>`**: Repository name (default: `yoga`)
- **`-t, --releaseTag <tag>`**: Release tag to download (default: `v3.2.1-test.2`)
- **`-l, --linkage <type>`**: Linkage type - `static` or `shared` (default: `static`)
- **`-p, --platform <name>`**: Optional platform filter - `darwin`, `linux`, or `windows`
- **`-h, --help`**: Display help information

**Examples:**

- Download all static libraries from the default release:
  ```bash
  bun download_artifacts.ts
  ```

- Download only macOS/Darwin libraries:
  ```bash
  bun download_artifacts.ts -p darwin
  ```

- Download shared libraries instead of static:
  ```bash
  bun download_artifacts.ts -l shared
  ```

- Download from a specific release tag:
  ```bash
  bun download_artifacts.ts -t v3.2.0
  ```

- Download Windows libraries from a specific release:
  ```bash
  bun download_artifacts.ts -t v3.2.1 -p windows
  ```

## Library Structure

The script downloads and organizes libraries in the following structure:

```
libs/
├── x86_64-macos/
│   ├── include/          # Header files
│   └── libyogacore.a     # Static library
├── aarch64-macos/
│   ├── include/
│   └── libyogacore.a
├── x86_64-linux/
│   ├── include/
│   └── libyogacore.a
├── aarch64-linux/
│   ├── include/
│   └── libyogacore.a
├── x86_64-windows/
│   ├── include/
│   └── yogacore.lib      # Windows static library
└── aarch64-windows/
    ├── include/
    └── yogacore.lib
```

## Supported Platforms

The script supports downloading pre-built libraries for:

- **macOS**: x86_64 (Intel) and ARM64 (Apple Silicon)
- **Linux**: x86_64 and ARM64
- **Windows**: x64 and ARM64

## Cache System

Downloaded assets are cached in your system's temporary directory to avoid re-downloading. The cache location varies by platform but is typically:

- macOS/Linux: `/tmp/gh-releases-cache/`
- Windows: `%TEMP%\gh-releases-cache\`

## Integration with Zig Build

This library structure is designed to work with the Zig build system. The directories match the target naming convention expected by `src/zig/build.zig`.
