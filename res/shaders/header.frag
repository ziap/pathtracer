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
