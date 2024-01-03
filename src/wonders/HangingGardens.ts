import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class HangingGardens extends BaseWonder {
  type = Wonder.HangingGardens
  requires = Advance.Pottery
  production = 300
  obsoleteBy = Advance.Invention
}