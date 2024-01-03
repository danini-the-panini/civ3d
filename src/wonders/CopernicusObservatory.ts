import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class CopernicusObservatory extends BaseWonder {
  type = Wonder.CopernicusObservatory
  requires = Advance.Astronomy
  production = 300
  obsoleteBy = Advance.Automobile
}