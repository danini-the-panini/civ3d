import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Pyramids extends BaseWonder {
  type = Wonder.Pyramids
  requires = Advance.Masonry
  production = 300
  obsoleteBy = Advance.Communism
}