#version 300 es

#ifdef GL_ES
precision highp float;
#endif

#define FOV 70.0
#define BOUNCE_LIMIT 50

uniform vec2 u_resolution;
uniform vec2 u_angle;
uniform vec3 u_origin;
uniform float u_time;

out vec4 frag_color;

struct material_t {
  vec4 albedo;

  // TODO: Roughness, metallic, ...
};

struct ray_t {
  vec3 origin;
  vec3 dir;
  float length;
  material_t hit_mat;
  vec3 hit_normal;
  bool hit_front;
};

struct sphere_t {
  vec3 center;
  float radius;
  material_t mat;
};

