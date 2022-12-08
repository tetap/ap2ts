import { decode } from "./enc.min.js";
import chalk from "chalk";

const parseEnc = decode();
export class Crypto {
  /**
   * 解析
   * @param code 加密字符串
   * @returns
   */
  run(code: string) {
    return parseEnc(code);
  }

  /**
   * 请求列表
   * @param href
   */
  async list(url: string) {
    try {
      const data = await fetch(url);
      const html = await data.text();
      const reg = /let arr = parseEnc\('(\S*)'\) ;/;
      const encode = html.match(reg);
      if (!encode || encode.length < 1) throw new Error("解析出错");
      return this.run(encode[1]);
    } catch (error) {
      console.log(chalk.red.bold("解析出错"));
      console.error(error);
      return null;
    }
  }

  /**
   * 获取接口详细信息
   * @param target_id
   * @param url
   */
  async details(target_id: string, url: string) {
    const base = "https://console-docs.apipost.cn";
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
    return await this.run(fetch_response.data);
  }
}
