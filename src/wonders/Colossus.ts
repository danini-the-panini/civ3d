import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Colossus extends BaseWonder {
  type = Wonder.Colossus
  requires = Advance.BronzeWorking
  production = 200
  obsoleteBy = Advance.Electricity
}