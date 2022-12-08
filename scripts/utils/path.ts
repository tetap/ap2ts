import fs from "fs";
import path from "path";
/**
 * 创建文件夹
 */
export function createFolder(href: string) {
  try {
    if (!href.startsWith(".")) href = `.${href}`;
    const paths = href.split("/");
    let folder = "";
    paths.forEach((item) => {
      folder += `${item}/`;
      if (!fs.existsSync(`${folder}`)) {
        fs.mkdirSync(`${folder}`);
      }
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
export class Path {
  /**
   * 创建文件夹
   * @param href
   * @returns
   */
  static mkdirSync(href: string) {
    try {
      href = path.normalize(href);
      const paths = href.split("\\");
      paths.reduce((prev, current) => {
        prev += `${current}\\`;
        if (!fs.existsSync(`${prev}`)) fs.mkdirSync(`${prev}`);
        return prev;
      }, "");
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * 创建文件
   * @param uri 存储路径
   * @param content 内容
   */
  static writeFileSync(uri: string, content: string) {
    if (!fs.existsSync(uri)) fs.writeFileSync(uri, content);
    else console.log(`${uri} 文件已存在`);
  }
}
