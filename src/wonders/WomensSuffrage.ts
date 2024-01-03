import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class WomensSuffrage extends BaseWonder {
  type = Wonder.WomensSuffrage
  requires = Advance.Industrialization
  production = 600
}