#!/usr/bin/env node
/**
 * gsuid_hub「可交互控制台」Demo 构建脚本。
 *
 * 用法：
 *   node scripts/hub.mjs build   构建 hub 的 Demo 静态产物（base=/hub/）并拷进 public/hub/
 *
 * docs 的 dev 与 build 都先跑它，再交给 next（dev/serve 同源托管 public/hub，iframe 走 /hub/…）。
 * 因此**不需要任何独立端口/服务**——这正是修掉「localhost 拒绝连接」的关键。
 *
 * hub 目录默认取 submodule `external/gsuid_hub`，可用环境变量 HUB_DIR 覆盖
 * （例如指向本地已装好依赖的 gsuid_hub 检出，免去 CI 之外的重复 install）。
 *
 * 见 plans/interactive-hub-showcase.md §5.1 / §2。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const mode = process.argv[2] ?? 'build';

const hubDir = process.env.HUB_DIR
  ? resolve(process.env.HUB_DIR)
  : resolve(repoRoot, 'external/gsuid_hub');
const publicHub = resolve(repoRoot, 'public/hub');

function run(cmdline, cwd) {
  console.log(`[hub] ${cmdline}  (cwd=${cwd})`);
  // 单字符串 + shell:true（命令均为内部固定字符串，无外部输入拼接）。
  const res = spawnSync(cmdline, { cwd, stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    console.error(`[hub] 命令失败（exit ${res.status}）：${cmdline}`);
    process.exit(res.status ?? 1);
  }
}

// 1) submodule 是否就位
if (!existsSync(join(hubDir, 'package.json'))) {
  console.error(
    `[hub] 找不到 hub 项目：${hubDir}\n` +
      `      请先初始化 submodule：  git submodule update --init --recursive\n` +
      `      或用环境变量指向本地检出： HUB_DIR=/path/to/gsuid_hub node scripts/hub.mjs ${mode}`,
  );
  process.exit(1);
}

// 2) 依赖（缺失才装；hub 用 yarn，lockfile 已入库）
if (!existsSync(join(hubDir, 'node_modules'))) {
  console.log('[hub] node_modules 缺失，执行 yarn install --frozen-lockfile ...');
  run('yarn install --frozen-lockfile', hubDir);
}

if (mode === 'build') {
  run('yarn build:demo', hubDir);
  const distDemo = join(hubDir, 'dist-demo');
  if (!existsSync(distDemo)) {
    console.error(`[hub] 构建产物缺失：${distDemo}`);
    process.exit(1);
  }
  rmSync(publicHub, { recursive: true, force: true });
  mkdirSync(publicHub, { recursive: true });
  cpSync(distDemo, publicHub, { recursive: true });
  console.log(`[hub] ✓ 已将 Demo 产物拷入  ${publicHub}`);
} else {
  console.error(`[hub] 未知模式：${mode}（仅支持 build）`);
  process.exit(1);
}
