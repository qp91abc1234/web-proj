/**
 * cli-run - 交互式 / 参数化启动 Vite（dev 或 build）
 *
 * 功能：
 * - 按当前工作目录扫描 .env.<mode>，选择网络/环境（对应 vite --mode）
 * - 选择打包环境 dev（起 dev server）或 build（执行 vite build）
 * - 通过 execa 注入 CLI_VITE_* 环境变量，供 vite.config / getPlugins 读取（不暴露给前端）
 * - 三个插件开关与 packEnv 无绑定：传了即写入对应 CLI_*，是否在 dev/build 中挂载由 getPlugins 按 isBuild 分支决定
 *
 * 参数（均可选；mode / packEnv 未传则 @inquirer/prompts 交互）：
 * - -c, --config <path>     Vite 配置文件路径
 * - -m, --mode <name>       对应 .env.<name> / vite --mode
 * - -p, --pack-env dev|build
 * - --devtools              写入 CLI_VITE_DEVTOOLS=true（vue-devtools，getPlugins 仅在 dev 分支消费）
 * - --inspect               写入 CLI_VITE_INSPECT=true（inspect，getPlugins 仅在 dev 分支消费）
 * - --visualizer            写入 CLI_VITE_VISUALIZER=true（visualizer，getPlugins 仅在 build 分支消费）
 *
 * 使用示例：
 *
 * 1. 交互选择 mode + packEnv 后启动
 *    node scripts/cli-run.js
 *
 * 2. 全参数无交互（build + development + 体积分析）
 *    node scripts/cli-run.js -m development -p build --visualizer -c vite-config/vite.config.ts
 *
 * 3. 开发 + inspect
 *    node scripts/cli-run.js -m development -p dev --inspect -c vite-config/vite.config.ts
 *
 * 说明：PROJECT_ROOT 为 process.cwd()，请在项目根目录执行。
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { execa } from 'execa'
import { Command } from 'commander'
import { select } from '@inquirer/prompts'

const PROJECT_ROOT = process.cwd()

function parseCliArgs() {
  const program = new Command()
  program
    .name('cli-run')
    .description('选择网络环境（.env.<mode>）与打包方式（dev/build）后执行 vite')
    .option('-c, --config <path>', 'Vite 配置文件路径（相对当前工作目录或绝对路径）')
    .option('-m, --mode <name>', '网络/环境，对应 vite --mode，指定后跳过交互选择')
    .option('-p, --pack-env <dev|build>', '打包环境 dev 或 build，指定后跳过交互选择')
    .option('--devtools', '开启 vite-plugin-vue-devtools（写入环境变量 CLI_VITE_DEVTOOLS）')
    .option('--inspect', '开启 vite-plugin-inspect（写入环境变量 CLI_VITE_INSPECT）')
    .option('--visualizer', '开启 rollup-plugin-visualizer（写入环境变量 CLI_VITE_VISUALIZER）')
    .helpOption('-h, --help', '显示帮助')
    .showHelpAfterError()
    .parse(process.argv)

  const opts = program.opts()
  const result = {
    config: undefined,
    mode: undefined,
    packEnv: undefined,
    pluginDevtools: false,
    pluginInspect: false,
    pluginVisualizer: false
  }

  if (opts.mode) {
    result.mode = opts.mode
  }
  if (opts.packEnv) {
    const p = opts.packEnv.toLowerCase()
    if (p !== 'dev' && p !== 'build') {
      console.error(chalk.red(`--pack-env 只能是 dev 或 build，当前: ${opts.packEnv}`))
      process.exit(1)
    }
    result.packEnv = p
  }

  if (opts.devtools) result.pluginDevtools = true
  if (opts.inspect) result.pluginInspect = true
  if (opts.visualizer) result.pluginVisualizer = true

  if (opts.config) {
    const resolved = path.isAbsolute(opts.config)
      ? opts.config
      : path.resolve(PROJECT_ROOT, opts.config)
    if (!fs.existsSync(resolved)) {
      console.error(chalk.red(`配置文件不存在: ${resolved}`))
      process.exit(1)
    }
    result.config = resolved
  }

  return result
}

function discoverEnvModes(rootDir = PROJECT_ROOT) {
  const ENV_FILE_RE = /^\.env\.(.+)$/
  const ENV_FILE_SKIP = new Set(['.env.example', '.env.sample'])
  const entries = fs.readdirSync(rootDir, { withFileTypes: true })
  const modes = new Set()

  for (const ent of entries) {
    if (!ent.isFile()) continue
    const name = ent.name

    if (ENV_FILE_SKIP.has(name)) continue
    const m = name.match(ENV_FILE_RE)
    if (!m) continue

    let mode = m[1]
    if (mode && mode.endsWith('.local')) {
      const base = mode.slice(0, -'.local'.length)
      mode = base || null
    }
    if (mode) modes.add(mode)
  }

  return [...modes].sort((a, b) => a.localeCompare(b))
}

async function promptSelectMode(modes) {
  if (modes.length === 0) {
    console.error(
      chalk.red('未找到任何 .env.<mode> 文件，请先在项目根目录添加例如 .env.development')
    )
    process.exit(1)
  }

  try {
    const answer = await select({
      message: '选择网络/环境',
      choices: modes.map((m) => ({ name: m, value: m })),
      default: modes[0]
    })
    return answer
  } catch {
    // 用户 Ctrl+C 等中断
    return null
  }
}

async function promptSelectPackEnv() {
  try {
    const answer = await select({
      message: '选择打包环境',
      choices: [
        { name: 'dev', value: 'dev' },
        { name: 'build', value: 'build' }
      ],
      default: 'dev'
    })
    return answer
  } catch {
    return null
  }
}

async function runVite({ packEnv, mode, config, pluginDevtools, pluginInspect, pluginVisualizer }) {
  const args = ['--mode', mode]
  if (config) {
    args.push('--config', config)
  }
  if (packEnv === 'build') {
    args.unshift('build')
  }
  const env = { ...process.env }
  if (pluginDevtools) env.CLI_VITE_DEVTOOLS = 'true'
  if (pluginInspect) env.CLI_VITE_INSPECT = 'true'
  if (pluginVisualizer) env.CLI_VITE_VISUALIZER = 'true'
  await execa('vite', args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    preferLocal: true,
    localDir: PROJECT_ROOT,
    env
  })
}

async function main() {
  const cli = parseCliArgs()

  let mode = cli.mode
  if (!mode) {
    const modes = discoverEnvModes()
    mode = await promptSelectMode(modes)
    if (mode == null) {
      process.exitCode = 1
      return
    }
    console.log(chalk.green('\n已选择 mode:'), chalk.bold.cyan(mode))
  }

  let packEnv = cli.packEnv
  if (!packEnv) {
    packEnv = await promptSelectPackEnv()
    if (packEnv == null) {
      process.exitCode = 1
      return
    }
    console.log(chalk.green('已选择 packEnv:'), chalk.bold.cyan(packEnv))
  }

  if (cli.mode && cli.packEnv) {
    console.log(
      chalk.green('mode:'),
      chalk.bold.cyan(mode),
      chalk.green('packEnv:'),
      chalk.bold.cyan(packEnv)
    )
  }

  await runVite({
    packEnv,
    mode,
    config: cli.config,
    pluginDevtools: cli.pluginDevtools,
    pluginInspect: cli.pluginInspect,
    pluginVisualizer: cli.pluginVisualizer
  })
}

main().catch((err) => {
  console.error(chalk.red(err instanceof Error ? err.message : err))
  process.exit(1)
})

export { discoverEnvModes, parseCliArgs, PROJECT_ROOT }
