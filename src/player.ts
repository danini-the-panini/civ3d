import { calcf } from "./calc_helpers";
import Unit from "./unit";
import World, { DIRECTIONS, HEIGHT, NEIGHBOURS, Point, WIDTH } from "./world";

export default class Player {
  world: World;
  units: Unit[] = []
  visible: boolean[][]

  constructor(world: World) {
    this.world = world
    this.visible = new Array(HEIGHT)
    for (let y = 0; y < HEIGHT; y++) {
      this.visible[y] = new Array(WIDTH)
      for (let x = 0; x < WIDTH; x++) {
        this.visible[y][x] = false
      }
    }
  }

  revealMap([x, y]: Point) {
    this.revealTile([x, y])
    NEIGHBOURS.forEach(([dx, dy]) => {
      this.revealTile([x + dx, y + dy])
    })
  }

  revealTile([x, y]: Point) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return
    this.visible[y][x] = true
    let tile = this.world.get(x, y)
    let object = tile.object
    if (object) { object.visible = true }
    [[0, 0], ...DIRECTIONS].forEach(([dx, dy]) => {
      let x2 = x + dx
      let y2 = y + dy
      if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return
      let t = this.world.get(x2, y2) 
      t.meshes.forEach(mesh => {
        mesh.material.uniforms.fog.value = calcf(this.world, [x2, y2], this.visible)
        mesh.material.uniformsNeedUpdate = true
      })
    })
  }
}