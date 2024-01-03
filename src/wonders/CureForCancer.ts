import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class CureForCancer extends BaseWonder {
  type = Wonder.CureForCancer
  requires = Advance.BronzeWorking
  production = 600
}