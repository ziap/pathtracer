#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_angle;
uniform vec3 u_origin;
uniform uint u_samples;

uniform sampler2D u_texture;
in vec2 tex_coord;

out vec4 frag_color;

struct material_t {
  vec3 albedo;
  float emissive;

  float metallic;
  float glossy;
};

struct ray_t {
  vec3 origin;
  vec3 dir;
  float length;
  int hit_id;
  vec3 hit_normal;
  bool hit_front;
};
