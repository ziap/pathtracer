#ifndef RAYTRACER_H
#define RAYTRACER_H

#include "imports.h"

typedef struct {
  int u_resolution;
  int u_angle;
  int u_origin;
  int u_samples;

  int tracer_program;
  int render_program;
  int vao;

  float angle_x;
  float angle_y;

  float last_mouse_x;
  float last_mouse_y;

  float pos_x;
  float pos_y;
  float pos_z;

  bool moved;
  unsigned int samples;

  int texture1;
  int texture2;
  int framebuffer;
} RayTracer;

extern void RayTracerInit(RayTracer*);
extern void RayTracerUpdate(
  RayTracer*, int, int, float, float, int, int, float
);

#endif
