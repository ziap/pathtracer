#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
in vec2 tex_coord;

vec3 ACESFilm(vec3 x) {
  float a = 2.51f;
  float b = 0.03f;
  float c = 2.43f;
  float d = 0.59f;
  float e = 0.14f;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0f, 1.0f);
}

out vec4 frag_color;

void main() {
  vec3 hdr_color = texture(u_texture, tex_coord).rgb;

  // TODO: Implement HDR rendering pipeline
  frag_color = vec4(ACESFilm(hdr_color), 1.0);
}
