import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class CureForCancer extends BaseWonder {
  static type = Wonder.CureForCancer
  static requires = Advance.BronzeWorking
  static production = 600
}