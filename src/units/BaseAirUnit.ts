import BaseUnit, { MovementType } from "./BaseUnit";

export default abstract class BaseAirUnit extends BaseUnit {
  static movementType = MovementType.Air
  static los = 2
  static capacity = 0
}