import inquirer from "inquirer";
import { Config } from "../config";
import pkg from "../../package.json";

export class Params {
  /**
   * 作者名称
   * @returns
   */
  static async author() {
    const config = Config.get();
    if (config.author) return config.author;
    const { author } = await inquirer.prompt([
      {
        type: "input",
        name: "author",
        message: "请输入作者名称",
        default: pkg.author || "",
      },
    ]);
    return author;
  }
  /**
   * 保存路径
   */
  static async savePath(href: string) {
    const config = Config.get();
    if (!href.startsWith("."))
      href = `${config.baseUrl ? config.baseUrl + href : "0" + href}`;
    return href;
  }

  /**
   * apipost url参数提取
   * @param uri
   */
  static url(uri: string) {
    const reg = /https:\/\/console-docs.apipost.cn\/preview\/(\S*)\//;
    const match = uri.match(reg);
    if (!match || match.length < 1) return "";
    return match[1];
  }
}
