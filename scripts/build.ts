import { $ } from "bun";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const build = async () => {
  await $`rm -rf dist`;
  await $`mkdir -p dist/assets`;

  const result = await Bun.build({
    entrypoints: ["main.ts"],
    outdir: "./dist",
    target: "bun",
    minify: true,
    sourcemap: "none",
  });

  if (!result.success) {
    console.error("Build failed");
    for (const message of result.logs) {
      console.error(message);
    }
    process.exit(1);
  }

  const assetsDir = "assets";
  const distAssetsDir = "dist/assets";
  const assetFiles = await readdir(assetsDir);

  for (const file of assetFiles) {
    const srcPath = join(assetsDir, file);
    const destPath = join(distAssetsDir, file);
    const fileStat = await stat(srcPath);

    if (fileStat.isFile()) {
      if (file.endsWith(".js")) {
        await Bun.build({
          entrypoints: [srcPath],
          outdir: distAssetsDir,
          minify: true,
          sourcemap: "none",
        });
      } else {
        await $`cp ${srcPath} ${destPath}`;
      }
    }
  }

  console.log("Build successful!");
};

build();
