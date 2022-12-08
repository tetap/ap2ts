import fs from "fs";
import { basename } from "path";
import chalk from "chalk";
import { header, template, controller } from "../../template";
import dayjs from "dayjs";
import { Path } from "../utils/path";
import { Params } from "../utils/param";
import { Text } from "../utils/text";

class Create {
  /**
   * 入口函数
   * @param path
   * @returns
   */
  async run(path: string) {
    const savePath = await Params.savePath(path);
    // if (fs.existsSync(savePath))
    // return console.log(chalk.red.bold("路径已存在"));
    // 创建目录
    const folderRresult = Path.mkdirSync(savePath);
    if (!folderRresult) return console.log(chalk.red("创建路径失败"));
    const NameSpace = Text.toUpperFirstLetter(basename(savePath));
    // 初始化入口文件
    this.main(savePath, NameSpace);
    // 组件目录
    this.Components(savePath);
    // 控制器
    this.Controller(savePath, NameSpace);
    console.log(chalk.green("创建成功"));
  }
  /**
   * 主文件
   * @param fileName
   * @returns
   */
  private main(uri: string, fileName: string) {
    const templateVal = template.replace(/{{name}}/g, fileName);
    const annotationVal = `${header
      .replace("{{date}}", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .replace("{{author}}", "zyc")
      .replace("{{description}}", fileName)}`;
    Path.writeFileSync(`${uri}/${fileName}.tsx`, annotationVal + templateVal);
  }
  /**
   * 组件目录
   * @param uri
   */
  private Components(uri: string) {
    const baseUri = `${uri}/Components`;
    Path.mkdirSync(baseUri);
    Path.mkdirSync(baseUri + "/src");
    Path.writeFileSync(`${baseUri}/index.ts`, "");
  }
  /**
   * 控制器
   * @param uri
   * @param fileName
   */
  private Controller(uri: string, fileName: string) {
    const baseUri = `${uri}/Controller`;
    Path.mkdirSync(baseUri);
    Path.writeFileSync(
      `${baseUri}/${fileName}Controller.ts`,
      `${controller.replace(/{{name}}/g, fileName)}`
    );
  }
}

export { Create };
