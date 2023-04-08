#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_texture;
in vec2 tex_coord;

out vec4 frag_color;

void main() {
  vec3 hdr_color = texture2D(u_texture, tex_coord).rgb;

  // TODO: Tone mapping
  frag_color = vec4(clamp(hdr_color, 0.0, 1.0), 1.0);
}
