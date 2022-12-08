import dayjs from "dayjs";
import inquirer from "inquirer";
import { annotation, header } from "../../template";
import { Params } from "../utils/param";
import { Path } from "../utils/path";
import { Text } from "../utils/text";

export interface IRequest {
  details: any;
  description: string[];
  savePath: string;
  model: string;
}

export class Request {
  static async run({ details, description, savePath, model }: IRequest) {
    const {
      name,
      request: {
        body: { raw, raw_para },
      },
    } = details;
    if (!raw) return;
    const rawJson = JSON.parse(raw);
    // 获取作者信息
    const author = await Params.author();
    // 描述注释
    const descriptionString = [...description, name].join("-");
    let result = ``;
    for (const key in rawJson) {
      const value = rawJson[key];
      const index = raw_para.findIndex((c) => c.key === key);
      if (index !== -1) {
        const { description, field_type } = raw_para[index];
        result += annotation.replace("{{annotation}}", description);
        result += `${key}: ${
          value === null ? Text.toLowerFirstLetter(field_type) : typeof value
        }\n\n`;
        raw_para.splice(index, 1);
      } else {
        result += `${key}: ${typeof value}\n\n`;
      }
    }
    raw_para.forEach((item) => {
      const { description, field_type, key } = item;
      result += annotation.replace("{{annotation}}", description);
      result += `${key}: ${Text.toLowerFirstLetter(field_type)}\n\n`;
    });
    let fileData = `${header
      .replace("{{date}}", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .replace("{{author}}", author)
      .replace("{{description}}", descriptionString)}\n`;
    fileData += `export interface I${Text.toUpperFirstLetter(
      model
    )}Request {\n${result}}`;
    Path.writeFileSync(
      `${savePath}/Request/${Text.toUpperFirstLetter(model)}Request.ts`,
      fileData
    );
  }
}
