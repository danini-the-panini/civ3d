import { PerspectiveCamera, Plane, Ray, Vector3 } from "three";

const SPEED = 1.0
const ZOOM_FACTOR=0.1
const MIN_DIST = 2.0
const MAX_DIST = 20.0

function easeInOut(x: number, a: number = 2.0) {
  return (x**a)/(x**a + (1-x)**a)
}

export default class CameraControls {
  camera: PerspectiveCamera;
  domElement: HTMLElement;
  groundPlane: Plane;

  private _camDirection: Vector3;
  private _camRight: Vector3;
  private _zoomDistance: number;
  private _ray: Ray;
  private _groundPoint: Vector3;
  
  constructor(camera: PerspectiveCamera, domElement: HTMLElement = document.body) {
    this.camera = camera
    this.domElement = domElement
    this.groundPlane = new Plane(new Vector3(0, 1, 0), 0)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleWheel = this.handleWheel.bind(this)
    this.domElement.addEventListener('keydown', this.handleKeyDown, false)
    this.domElement.addEventListener('wheel', this.handleWheel, false)
    
    this._camDirection = new Vector3()
    this._camRight = new Vector3()
    this._ray = new Ray()
    this._groundPoint = new Vector3()

    this._zoomDistance = 0.5
    this._updateCameraPosition()
  }

  set zoomDistance(v: number) {
    if (v < 0.0) v = 0.0
    if (v > 1.0) v = 1.0
    this._zoomDistance = v
    this._updateCameraPosition()
  }

  get zoomDistance(): number {
    return this._zoomDistance
  }

  destructer() {
    this.domElement.removeEventListener('keydown', this.handleKeyDown, false)
    this.domElement.removeEventListener('wheel', this.handleWheel, false)
  }

  handleKeyDown(event: KeyboardEvent) {
    this.camera.getWorldDirection(this._camDirection)
    this._camRight.copy(this._camDirection).cross(this.camera.up)
    this._camDirection.y = 0.0
    this._camDirection.normalize().multiplyScalar(SPEED)
    this._camRight.y = 0.0
    this._camRight.normalize().multiplyScalar(SPEED)
    switch (event.key) {
      case 'ArrowUp':
        this.camera.position.add(this._camDirection)
        break
      case 'ArrowDown':
        this.camera.position.add(this._camDirection.negate())
        break
      case 'ArrowLeft':
        this.camera.position.add(this._camRight.negate())
        break
      case 'ArrowRight':
        this.camera.position.add(this._camRight)
        break
    }
  }
  
  handleWheel(event: WheelEvent) {
    let delta = (event.deltaY / 102) * ZOOM_FACTOR
    this.zoomDistance += delta
  }

  _updateCameraPosition() {
    this.camera.getWorldDirection(this._camDirection)
    this._ray.origin.copy(this.camera.position)
    this._ray.direction.copy(this._camDirection.normalize())
    this._ray.intersectPlane(this.groundPlane, this._groundPoint)
    this._ray.origin.copy(this._groundPoint)
    this._ray.direction.copy(this._camDirection.negate())
    let newDistance = MIN_DIST + (MAX_DIST-MIN_DIST)*(easeInOut(this._zoomDistance))
    this._ray.at(newDistance, this.camera.position)
  }
}