import BaseUnit, { MovementType } from "./BaseUnit";

export default abstract class BaseLandUnit extends BaseUnit {
  static movementType = MovementType.Land
  static los = 1
  static capacity = 0
  static movement = 1
}