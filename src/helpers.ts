import { Vector3 } from "three"
import { Point, WIDTH } from "./world"

export function irand(i: number): number {
  return Math.floor(Math.random() * i)
}

export function position3d(x: number, y: number): [number, number, number] {
  return [(WIDTH/2)-x-0.5, 0, -y]
}

export function position2d(v: Vector3): Point {
  return [Math.ceil((WIDTH/2) - v.x - 0.5), Math.ceil(-v.z)]
}