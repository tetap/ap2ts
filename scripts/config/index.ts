import { readFileSync, writeFileSync } from "fs";

/*
 *@description: 参数配置
 *@author: zyc
 *@date-time: 2022-12-06 09:59:24
 */
export interface IConfig {
  author: string;
  baseUrl: string;
}

export const Config = {
  save(config: IConfig) {
    const json: IConfig = JSON.parse(
      readFileSync(__dirname + "/config.json", {
        encoding: "utf-8",
      })
    );
    console.log(config);
    json.author = config.author ? config.author : json.author;
    json.baseUrl = config.baseUrl ? config.baseUrl : json.baseUrl;
    writeFileSync(__dirname + "/config.json", JSON.stringify(json, null, 2));
    console.log("保存成功");
  },
  show() {
    const json = JSON.parse(
      readFileSync(__dirname + "/config.json", {
        encoding: "utf-8",
      })
    );
    console.dir(json);
  },
  get(): IConfig {
    const json = JSON.parse(
      readFileSync(__dirname + "/config.json", {
        encoding: "utf-8",
      })
    );
    return json;
  },
};
