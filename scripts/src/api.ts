/*
 *@description: 解析ts结构
 *@author: zyc
 *@date-time: 2022-12-02 11:12:17
 */
import { writeFileSync } from "fs";
import inquirer from "inquirer";
import dayjs from "dayjs";
import path, { basename } from "path";
import chalk from "chalk";
import pkg from "../../package.json";
import { header } from "../../template";
import { decode } from "../crypto/enc.min.js";
import { createFolder } from "../utils/path";
import { Crypto } from "../crypto";
import { Request } from "../crypto/request";
import { Response } from "../crypto/response";
import { Params } from "../utils/param";
import { Text } from "../utils/text";

interface parsingInterface {
  url: string;
  list: any[];
  savePath: string;
}

const parseEnc = decode();
class Parsing {
  async run(url: string, path: string) {
    const crypto = new Crypto();
    const data = await crypto.list(url);
    if (!data) return console.log(chalk.red.bold("解析出错"));
    const list = data.list;
    // 保存路径
    const savePath = await Params.savePath(path);
    // 创建目录
    const folderRresult = createFolder(savePath);
    if (!folderRresult) return console.log(chalk.red("创建路径失败"));
    // 初始化目录结构
    const directoryRresult =
      createFolder(`${savePath}/Request`) &&
      createFolder(`${savePath}/Response`);
    if (!directoryRresult) return console.log(chalk.red("初始化目录结构失败"));
    const urlParam = Params.url(url);
    if (!urlParam) return console.log(chalk.red("请输入正确的URL"));
    await this.parsingInterface({ url: urlParam, list, savePath });
  }
  /**
   * 解析接口数据
   */
  private async parsingInterface({ url, list, savePath }: parsingInterface) {
    // 获取注释作者
    // const author = await Params.author();
    // 描述
    let description: string[] = [];
    const crypto = new Crypto();
    await recursive(list);
    async function recursive(data: any[]) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.target_type === "folder") description.push(item.name);
        if (item.children && item.children.length) recursive(item.children);
        if (item.target_type === "api") {
          const { model } = await inquirer.prompt([
            {
              type: "input",
              name: "model",
              message: "请输入模块名称",
              default: item.name,
            },
          ]);
          const details = await crypto.details(item.target_id, url);
          await Request.run({
            model,
            details,
            description: [...description],
            savePath,
          });
          await Response.run({
            details,
            model,
            description: [...description],
            savePath,
          });
        }
      }
    }
  }
  /**
   * 输入
   */
  async input(url: string, href: string) {
    // 请求页面获取解密数据
    const data = await fetch(url);
    const html = await data.text();
    const startText = `let arr = parseEnc('`;
    const startIndex = html.indexOf(startText);
    const endIndex = html.indexOf(`') ;`, startIndex + startText.length);
    const encode = html.slice(startIndex + startText.length, endIndex);
    const { author } = await inquirer.prompt([
      {
        type: "input",
        name: "author",
        message: "请输入作者名称",
        default: pkg.author || "",
      },
    ]);
    if (!href) {
      const { path } = await inquirer.prompt([
        {
          type: "input",
          name: "path",
          message: "请输入输出路径",
        },
      ]);
      if (!path) return console.log(chalk.red.bold("请输入路径"));
      href = path;
    }
    if (!href.startsWith(".")) href = `.${href}`;
    createFolder(href);
    // 解密函数
    const code = parseEnc(encode);
    const fileName = path.basename(href);
    const b = "https://console-docs.apipost.cn/preview/";
    const index1 = url.indexOf(b);
    const index2 = url.indexOf("/", index1 + b.length);
    const _url = url.slice(index1 + b.length, index2);
    this.init(code.list, author, fileName, href, _url);
  }

  /**
   * 开始解析
   */
  init(
    data: Array<any>,
    author: string,
    NameSpace: string,
    path: string,
    url: string
  ) {
    let description = "";
    const self = this;
    // 递归树结构
    async function recursive(data: Array<any>) {
      for (let i = 0; i < data.length; i++) {
        const { name, children, target_type, target_id } = data[i];
        if (target_type === "folder") {
          description += `${name}-`;
          return recursive(children);
        } else if (target_type === "api") {
          description = description.slice(0, description.length - 1);
        }
        // 获取接口详细数据
        const encode = await self.getApisDetails(target_id, url);

        let { model } = await inquirer.prompt([
          {
            type: "input",
            name: "model",
            message: "请输入模块名称",
            default: encode.name,
          },
        ]);
        const model1 = model.split("");
        model1[0] = model1[0].toUpperCase();
        model = model1.join("");
        // 解析请求体
        self.request({ encode, author, description, NameSpace, path, model });
        // 解析响应体
        self.response({ encode, author, description, NameSpace, path, model });
      }
    }
    recursive(data);
  }
  /**
   * 获取接口详情信息
   * @param url
   */
  async getApisDetails(target_id: string, url: string) {
    // 接口地址
    const base = "https://console-docs.apipost.cn";
    // 发送请求获取详细接口数据
    const fetch_response = await (
      await fetch(`${base}/getApisDetails`, {
        headers: {
          accept: "*/*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua":
            '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `target_id=${target_id}&url=${url}`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      })
    ).json();
    // 解密数据
    const encode = parseEnc(fetch_response.data);
    return encode;
  }
  /**
   * 请求体格式化并输出文件
   */
  async request({
    encode,
    author,
    description,
    NameSpace,
    path,
    model,
  }: {
    encode: any;
    author: string;
    description: string;
    NameSpace: string;
    path: string;
    model: string;
  }) {
    //#region request 请求体格式化并输出文件
    const { raw_para } = encode.request.body;
    let fileData = `${header
      .replace("{{date}}", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .replace("{{author}}", author)
      .replace("{{description}}", description + " 请求体")}\n`;
    if (raw_para && raw_para.length) {
      fileData += `export interface I${NameSpace}${model}Request {`;
      const data: any = {};
      raw_para.forEach((element) => {
        if (!element.key) return;
        fileData += `\n  /*
   * ${element.description}
   */`;
        fileData += `\n  ${element.key}${
          element.not_null ? "" : "?"
        }: ${element.field_type.toLowerCase()}`;
      });
      fileData += `\n}`;
    }
    createFolder(path + "/Request");
    writeFileSync(`${path}/Request/${NameSpace}${model}Request.ts`, fileData);
    //#endregion
  }
  /**
   * 解析响应体
   */
  response({
    encode,
    author,
    description,
    NameSpace,
    path,
    model,
  }: {
    encode: any;
    author: string;
    description: string;
    NameSpace: string;
    path: string;
    model: string;
  }) {
    const { parameter } = encode.response.success;
    let fileData = `${header
      .replace("{{date}}", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .replace("{{author}}", author)
      .replace("{{description}}", description + " 返回体")}\n`;
    if (parameter && parameter.length) {
      let withText = "data.";
      const not_object_array = [...parameter];
      fileData += `export interface I${NameSpace}Response {`;
      parameter
        .filter((c) => c.key.startsWith(withText))
        .filter((c) => c.field_type === "Object")
        .forEach((element) => {
          fileData += `\n  /*
   * ${element.description}
   */`;
          const key = element.key.replace(withText, "");
          fileData += `\n  ${key}: {${parameter
            .filter(
              (c) => c.key.startsWith(element.key) && c.key !== element.key
            )
            .map((item) => {
              const index = not_object_array.findIndex(
                (c) => c.key === item.key
              );
              not_object_array.splice(index, 1);
              return `\n    /*
     * ${item.description}
     */
    ${item.key.replace(
      element.key + ".",
      ""
    )}: ${item.field_type.toLowerCase()}`;
            })
            .join("")}
  }`;
        });
      not_object_array
        .filter((c) => c.key.startsWith(withText))
        .filter((c) => c.field_type !== "Object")
        .forEach((element) => {
          fileData += `\n  /*
   * ${element.description}
   */`;
          fileData += `\n  ${element.key.replace(
            withText,
            ""
          )}: ${element.field_type.toLowerCase()}`;
        });
      fileData += `\n}`;
    }
    createFolder(path + "/Response");
    writeFileSync(`${path}/Response/${NameSpace}Response.ts`, fileData);
  }
}

export { Parsing };
