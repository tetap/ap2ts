import { Params } from "../utils/param";
import inquirer from "inquirer";
import { isArray, isObject, isEmpty } from "lodash";
import { annotation, header } from "../../template";
import { Text } from "../utils/text";
import dayjs from "dayjs";
import { Path } from "../utils/path";

export interface IResponse {
  details: any;
  description: string[];
  savePath: string;
  model: string;
}

export class Response {
  static async run({ details, description, savePath, model }: IResponse) {
    const {
      name,
      response: {
        success: { raw, parameter },
      },
    } = details;
    // 空描述跳出
    if (isEmpty(raw)) return;
    const base = "data";
    const rawJson = JSON.parse(raw)[base];
    // 取不出data跳出
    if (!rawJson) return;
    // console.log("rawJson", rawJson);
    parameter.forEach((itemRaw) => {
      const arr = itemRaw.key.split(".");
      itemRaw.newKey = arr[arr.length - 1];
    });
    // console.log(parameter);
    // 获取作者信息
    const author = await Params.author();
    // 描述注释
    const descriptionString = [...description, name].join("-");
    let result = ``;
    for (const key in rawJson) {
      const value = rawJson[key];
      const type = typeof value;
      const index = parameter.findIndex((c) => c.newKey === key);
      if (index !== -1) {
        const { description, field_type } = parameter[index];
        if (type === "object") {
          if (isArray(value)) {
            result += annotation.replace("{{annotation}}", description);
            result += `${key}: ${Response.ArrayToInterface(
              value[0],
              parameter
            )}`;
          } else if (isObject(value)) {
            result += annotation.replace("{{annotation}}", description);
            result += `${key}: ${Response.ArrayToInterface(value, parameter)}`;
          }
        } else {
          result += annotation.replace("{{annotation}}", description);
          result += `${key}: ${
            value === null ? Text.toLowerFirstLetter(field_type) : typeof value
          }\n\n`;
        }
      }
    }
    let fileData = `${header
      .replace("{{date}}", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .replace("{{author}}", author)
      .replace("{{description}}", descriptionString)}\n`;
    fileData += `export interface I${Text.toUpperFirstLetter(
      model
    )}Request {\n${result}}`;
    Path.writeFileSync(
      `${savePath}/Response/${Text.toUpperFirstLetter(model)}Response.ts`,
      fileData
    );
    console.log(result);
  }
  /**
   * 数字item转接口
   */
  static ArrayToInterface(obj: any, parameter: any[]) {
    const result = Object.entries(obj).reduce((prev, [key, value]) => {
      const index = parameter.findIndex((c) => c.newKey === key);
      if (index !== -1) {
        const { description, field_type } = parameter[index];
        prev += annotation.replace("{{annotation}}", description);
        prev += `${key}: ${
          value === null ? Text.toLowerFirstLetter(field_type) : typeof value
        }\n\n`;
      } else {
        prev += `${key}: ${typeof value}\n\n`;
      }
      return prev;
    }, "");
    return `{\n${result}}[]\n\n`;
  }
}
