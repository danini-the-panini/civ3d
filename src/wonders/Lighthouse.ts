import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Lighthouse extends BaseWonder {
  type = Wonder.Lighthouse
  requires = Advance.MapMaking
  production = 200
  obsoleteBy = Advance.Magnetism
}