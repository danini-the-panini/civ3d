uniform sampler2D baseTex;
uniform sampler2D irrigationTex;
uniform sampler2D pollutionTex;
uniform sampler2D fortressTex;
uniform sampler2D terrainTex;
uniform sampler2D roadTex;
uniform sampler2D railroadTex;

uniform bool irrigation;
uniform bool pollution;
uniform bool fortress;

varying vec2 vUv;
varying vec2 vUv2;

uniform int road;
uniform int railroad;

vec4 combine_alpha(vec4 a, vec4 b, float alpha) {
  float alpha2 = b.a * alpha;
  return vec4(a.rgb * (1.0 - alpha2) + b.rgb * alpha2, 1.0);
}

vec4 combine(vec4 a, vec4 b) {
  return combine_alpha(a, b, 1.0);
}

vec2 roadUv(vec2 uv, int k) {
  return (uv + vec2(float(k%3), float(k/3))) / 3.0;
}

vec4 roadTexture2D(sampler2D tex, vec2 uv, int k) {
  return texture2D(tex, roadUv(uv, k));
}

void main() {
  vec4 col = texture2D(baseTex, vUv2);
  if (irrigation) {
    col = combine(col, texture2D(irrigationTex, vUv2));
  }
  col = combine(col, texture2D(terrainTex, vUv));
  if (road == (1<<4)) {
    col = combine(col, roadTexture2D(roadTex, vUv2, 4));
  } else if (railroad == (1<<4)) {
    col = combine(col, roadTexture2D(railroadTex, vUv2, 4));
  }
  for (int k = 0; k < 9; k++) {
    int r = 1<<k;
    if (k != 4) {
      if ((railroad & r) > 0) {
        col = combine(col, roadTexture2D(railroadTex, vUv2, k));
      } else if ((road & r) > 0) {
        col = combine(col, roadTexture2D(roadTex, vUv2, k));
      }
    }
  }
  if (pollution) {
    col = combine_alpha(col, texture2D(pollutionTex, vUv2), 0.6);
  }
  if (fortress) {
    col = combine_alpha(col, texture2D(fortressTex, vUv2), 0.6);
  }

  gl_FragColor = col;
}