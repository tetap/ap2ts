export class Text {
  /**
   * 首字符大写
   * @param text
   * @returns {string} text
   */
  static toUpperFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  /**
   * 首字符小写
   * @param text
   * @returns {string} text
   */
  static toLowerFirstLetter(text: string) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  }
}
