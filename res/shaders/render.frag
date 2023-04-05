#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;
in vec2 tex_coord;

out vec4 frag_color;

void main() {
  frag_color = texture2D(texture, tex_coord);
}
