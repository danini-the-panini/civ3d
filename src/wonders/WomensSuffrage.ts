import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class WomensSuffrage extends BaseWonder {
  static type = Wonder.WomensSuffrage
  static requires = Advance.Industrialization
  static production = 600
}