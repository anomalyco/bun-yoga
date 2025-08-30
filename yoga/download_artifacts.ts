#!/usr/bin/env bun

import path from "path";
import fs from "fs/promises";
import { tmpdir } from "os";
import { program } from "commander";

interface Args {
  owner: string;
  repo: string;
  releaseTag: string;
  linkage: "static" | "shared";
  platform?: string;
}

interface ProcessableAsset {
  assetData: any;
  platformDir: string;
}

const platformArchToDirMap: Record<string, string> = {
  "darwin-x86_64": "x86_64-macos",
  "darwin-arm64": "aarch64-macos",
  "linux-x86_64": "x86_64-linux",
  "linux-aarch64": "aarch64-linux",
  "windows-x86_64": "x86_64-windows",
  "windows-ARM64": "aarch64-windows",
};

function getCacheDir(owner: string, repo: string, releaseTag: string): string {
  return path.join(
    tmpdir(),
    "gh-releases-cache",
    `${owner}-${repo}`,
    releaseTag
  );
}

function getAssetCacheDir(
  owner: string,
  repo: string,
  releaseTag: string,
  assetName: string
): string {
  return path.join(getCacheDir(owner, repo, releaseTag), assetName);
}

async function isAssetCached(
  owner: string,
  repo: string,
  releaseTag: string,
  assetName: string
): Promise<boolean> {
  const cacheDir = getAssetCacheDir(owner, repo, releaseTag, assetName);
  try {
    const files = await fs.readdir(cacheDir);
    return files.length > 0;
  } catch {
    return false;
  }
}

async function getCachedAssetPath(
  owner: string,
  repo: string,
  releaseTag: string,
  assetName: string
): Promise<string | null> {
  const cacheDir = getAssetCacheDir(owner, repo, releaseTag, assetName);
  try {
    const files = await fs.readdir(cacheDir);
    if (files.length > 0) {
      return path.join(cacheDir, files[0]!);
    }
  } catch {
    return null;
  }
  return null;
}

function parseAssetName(
  assetName: string
): { platform: string; arch: string; linkage: string } | null {
  const match = assetName.match(
    /yoga-.*?-(darwin|linux|windows)-(x86_64|arm64|aarch64|x64|ARM64)-(static|shared)\.tar\.gz$/
  );
  if (!match) return null;

  const [, platform, arch, linkage] = match;
  return { platform: platform!, arch: arch!, linkage: linkage! };
}

function getPlatformDirFromAsset(assetName: string): string | null {
  const parsed = parseAssetName(assetName);
  if (!parsed) return null;

  let normalizedArch = parsed.arch;
  if (parsed.arch === "x64") normalizedArch = "x86_64";
  if (parsed.arch === "arm64") normalizedArch = "arm64";
  if (parsed.arch === "ARM64") normalizedArch = "ARM64";
  if (parsed.arch === "aarch64") normalizedArch = "aarch64";

  const platformArch = `${parsed.platform}-${normalizedArch}`;
  return platformArchToDirMap[platformArch] || null;
}

async function main(args: Args) {
  console.log("Using gh CLI for GitHub releases API and asset downloads.");
  console.log(
    "Fetching release assets for:",
    `${args.owner}/${args.repo}@${args.releaseTag}`,
    "Linkage:",
    args.linkage
  );

  const listReleasesEndpoint = `repos/${args.owner}/${args.repo}/releases/tags/${args.releaseTag}`;
  console.log(`Getting release info using: gh api ${listReleasesEndpoint}`);

  try {
    const listProc = Bun.spawnSync(["gh", "api", listReleasesEndpoint], {
      stdout: "pipe",
      stderr: "pipe",
    });

    if (listProc.exitCode !== 0) {
      console.error(
        `Error getting release info with gh api. Exit code: ${listProc.exitCode}`
      );
      if (listProc.stdout)
        console.error(`Stdout: ${listProc.stdout.toString()}`);
      if (listProc.stderr)
        console.error(`Stderr: ${listProc.stderr.toString()}`);
      console.error(
        "Please ensure 'gh' CLI is installed, authenticated ('gh auth login'), and has necessary permissions."
      );
      process.exit(1);
    }

    const listOutput = listProc.stdout.toString();
    const data = JSON.parse(listOutput) as {
      assets: any[];
      message?: string;
      tag_name?: string;
    };

    if (data.message && data.message.toLowerCase().includes("not found")) {
      console.error(
        `Error: Could not find release "${args.releaseTag}". Message: ${data.message}`
      );
      process.exit(1);
    }

    if (!data.assets || data.assets.length === 0) {
      console.log("No assets found for this release.");
      return;
    }

    console.log(
      `Found ${data.assets.length} assets in release ${data.tag_name}`
    );

    const assetsToProcess = new Set<ProcessableAsset>();
    for (const asset of data.assets) {
      const assetName = asset.name;

      if (!assetName.endsWith(".tar.gz")) {
        continue;
      }

      const parsed = parseAssetName(assetName);
      if (!parsed) {
        console.log(
          `Skipping asset with unrecognized name pattern: ${assetName}`
        );
        continue;
      }

      if (parsed.linkage !== args.linkage) {
        continue;
      }

      const platformDir = getPlatformDirFromAsset(assetName);
      if (!platformDir) {
        console.log(`No platform directory mapping for: ${assetName}`);
        continue;
      }

      if (args.platform) {
        const platformMatch =
          platformDir.includes(args.platform.toLowerCase()) ||
          parsed.platform.includes(args.platform.toLowerCase()) ||
          assetName.toLowerCase().includes(args.platform.toLowerCase());

        if (!platformMatch) {
          continue;
        }
      }

      assetsToProcess.add({ assetData: asset, platformDir });
    }

    if (assetsToProcess.size === 0) {
      if (args.platform) {
        console.log(
          `No assets found matching platform '${args.platform}' and linkage '${args.linkage}'.`
        );
      } else {
        console.log(`No assets found matching linkage '${args.linkage}'.`);
      }
      return;
    }

    console.log(`Processing ${assetsToProcess.size} assets...`);

    for (const item of assetsToProcess) {
      const { assetData, platformDir } = item;
      const assetName = assetData.name;
      const assetId = assetData.id;
      const assetSizeBytes = assetData.size;

      const assetDir = path.join(__dirname, "libs", platformDir);

      console.log(
        `Processing asset: ${assetName}, ID: ${assetId}, Size: ${assetSizeBytes} bytes`
      );
      console.log(`Target directory: ${assetDir}`);

      let downloadedArchivePath: string;

      try {
        const isCached = await isAssetCached(
          args.owner,
          args.repo,
          args.releaseTag,
          assetName
        );

        if (isCached) {
          const cachedPath = await getCachedAssetPath(
            args.owner,
            args.repo,
            args.releaseTag,
            assetName
          );
          if (cachedPath) {
            console.log(`Using cached asset: ${cachedPath}`);
            downloadedArchivePath = cachedPath;
          } else {
            throw new Error("Cached asset path not found");
          }
        } else {
          const assetCacheDir = getAssetCacheDir(
            args.owner,
            args.repo,
            args.releaseTag,
            assetName
          );
          await fs.mkdir(assetCacheDir, { recursive: true });
          console.log(`Created cache directory: ${assetCacheDir}`);

          console.log(
            `Downloading "${assetName}" using gh release download...`
          );
          const ghDownloadProc = Bun.spawnSync(
            [
              "gh",
              "release",
              "download",
              args.releaseTag,
              "--repo",
              `${args.owner}/${args.repo}`,
              "--pattern",
              assetName,
              "--dir",
              assetCacheDir,
            ],
            {
              stdout: "pipe",
              stderr: "pipe",
            }
          );

          if (ghDownloadProc.exitCode !== 0) {
            console.error(
              `Error downloading asset "${assetName}" with gh release download. Exit code: ${ghDownloadProc.exitCode}`
            );
            if (ghDownloadProc.stdout)
              console.error(`Stdout: ${ghDownloadProc.stdout.toString()}`);
            if (ghDownloadProc.stderr)
              console.error(`Stderr: ${ghDownloadProc.stderr.toString()}`);
            continue;
          }
          console.log(
            `Asset "${assetName}" downloaded by gh to ${assetCacheDir}`
          );
          if (ghDownloadProc.stdout.length > 0)
            console.log(
              `gh download stdout: ${ghDownloadProc.stdout.toString()}`
            );
          if (ghDownloadProc.stderr.length > 0)
            console.warn(
              `gh download stderr: ${ghDownloadProc.stderr.toString()}`
            );

          const filesInCacheDir = await fs.readdir(assetCacheDir);
          if (filesInCacheDir.length === 0) {
            console.error(
              `No files found in cache directory: ${assetCacheDir}`
            );
            continue;
          }
          if (filesInCacheDir.length > 1) {
            console.warn(
              `Multiple files found in cache directory: ${assetCacheDir}. Using the first one: ${filesInCacheDir[0]}`
            );
          }
          const downloadedArchiveFileName = filesInCacheDir[0]!;
          downloadedArchivePath = path.join(
            assetCacheDir,
            downloadedArchiveFileName
          );

          console.log(
            `Downloaded and cached archive: ${downloadedArchivePath}`
          );
        }

        await fs.rm(assetDir, { recursive: true, force: true });
        await fs.mkdir(assetDir, { recursive: true });
        console.log(`Ensured final asset directory is clean: ${assetDir}`);

        try {
          await fs.access(downloadedArchivePath);
        } catch (e) {
          console.error(
            `Archive file not found at path: ${downloadedArchivePath}`
          );
          continue;
        }

        console.log(
          `Unpacking ${downloadedArchivePath} to ${assetDir} using tar...`
        );
        const tarProc = Bun.spawnSync(
          ["tar", "xf", downloadedArchivePath, "-C", assetDir],
          { stdout: "pipe", stderr: "pipe" }
        );

        const stdoutContent = tarProc.stdout.toString("utf-8");
        const stderrContent = tarProc.stderr.toString("utf-8");

        if (tarProc.exitCode !== 0) {
          console.error(
            `Error unpacking "${assetName}" with tar. Exit code: ${tarProc.exitCode}`
          );
          if (stdoutContent.length > 0)
            console.error(`Stdout: ${stdoutContent}`);
          if (stderrContent.length > 0)
            console.error(`Stderr: ${stderrContent}`);
        } else {
          console.log(`Unpacked "${assetName}" to ${assetDir} successfully.`);
          if (stdoutContent.length > 0)
            console.log(`tar stdout: ${stdoutContent}`);
          if (stderrContent.length > 0)
            console.warn(`tar stderr (on success): ${stderrContent}`);
        }
      } catch (error) {
        console.error(`Error processing asset ${assetName}:`, error);
      }
    }

    console.log(
      `\nAssets cached in: ${getCacheDir(
        args.owner,
        args.repo,
        args.releaseTag
      )}`
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    if (error instanceof Error && error.message.includes("ENOENT")) {
      console.error(
        "This might be because the 'gh' command was not found. Please ensure it is installed and in your PATH."
      );
    }
    process.exit(1);
  }
}

if (import.meta.main) {
  const defaultOwner = "kommander";
  const defaultRepo = "yoga";
  const defaultReleaseTag = "v3.2.1-test.3";
  const defaultLinkage = "static";

  program
    .name("download_artifacts.ts")
    .description("Downloads and unpacks release assets from a GitHub release.")
    .option("-o, --owner <owner>", "Repository owner", defaultOwner)
    .option("-r, --repo <repo>", "Repository name", defaultRepo)
    .option(
      "-t, --releaseTag <tag>",
      "Release tag (e.g., v3.2.1-test.2)",
      defaultReleaseTag
    )
    .option(
      "-l, --linkage <type>",
      "Linkage type: 'static' or 'shared'",
      defaultLinkage
    )
    .option(
      "-p, --platform <name>",
      "Optional: Specific platform to download (e.g., darwin, linux, windows)"
    )
    .action((options) => {
      const owner = options.owner;
      const repo = options.repo;
      const releaseTag = options.releaseTag;
      const linkage = options.linkage.toLowerCase();
      const platform = options.platform;

      console.log(`Using owner: ${owner}`);
      console.log(`Using repo: ${repo}`);
      console.log(`Using releaseTag: ${releaseTag}`);
      console.log(`Using linkage: ${linkage}`);
      if (platform) {
        console.log(`Using platform: ${platform}`);
      }

      if (linkage !== "static" && linkage !== "shared") {
        console.error(
          `Invalid linkage type "${linkage}". Must be "static" or "shared".`
        );
        program.help();
      }

      main({
        owner,
        repo,
        releaseTag,
        linkage: linkage as "static" | "shared",
        platform,
      });
    });

  program.parse(process.argv);
}
