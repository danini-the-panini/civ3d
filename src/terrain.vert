varying vec2 vUv;
varying vec2 vUv2;
// varying vec2 vUvRoad;
// varying vec2 vUvRail;

// uniform int roadTile;
// uniform int railTile

void main() {
  vUv = uv;
  vUv2 = vec2(position.x, -position.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}