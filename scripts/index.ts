import { program } from "commander";
import pkg from "../package.json";
import { Parsing } from "./src/api";
import { Create } from "./src/create";
import { Config } from "./config";
import chalk from "chalk";

program.name(pkg.name).usage(`<command> [option]`).version(pkg.version);
program
  .command("run <url>")
  .option("-p --path <path>", "输出路径")
  .description(`创建接口 ${pkg.name} run <url>`)
  .action((url, options) => {
    if (!options.path) return console.log(chalk.red.bold("请输入路径 -p"));
    const parsing = new Parsing();
    parsing.run(url, options.path);
  });

// 创建页面
program
  .command("create <path>")
  .description(`创建页面 ${pkg.name} create <path>`)
  .action((path) => {
    const create = new Create();
    create.run(path);
  });

// 配置文件
program
  .command("config")
  .option("-l --list", "查看参数")
  .option("-a --author <author>", "作者")
  .option("-p --path <baseUrl>", "文件公共路径 ./src/pages")
  .description(`保存配置 ${pkg.name} config -a <author> -p <path>`)
  .action((options) => {
    if (options.list) {
      Config.show();
    } else {
      Config.save({ author: options.author, baseUrl: options.path });
    }
  });
program.parse(process.argv);
