uniform sampler2D baseTex;
uniform sampler2D irrigationTex;
uniform sampler2D terrainTex;
// uniform sampler2D road;
// uniform sampler2D rail;

uniform bool irrigation;

varying vec2 vUv;
varying vec2 vUv2;

vec4 combine(vec4 a, vec4 b) {
    return vec4(a.rgb * (1.0 - b.a) + b.rgb * b.a, 1.0);
}

void main() {
  vec4 col = texture2D(baseTex, vUv2);
  if (irrigation) {
    col = combine(col, texture2D(irrigationTex, vUv2));
  }
  col = combine(col, texture2D(terrainTex, vUv));

  gl_FragColor = col;
}