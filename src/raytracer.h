#ifndef RAYTRACER_H
#define RAYTRACER_H

typedef struct {
  int u_resolution;
  int u_angle;
  int u_origin;
  int u_time;

  int program;
  int vao;

  float angle_x;
  float angle_y;

  float last_mouse_x;
  float last_mouse_y;

  float pos_x;
  float pos_y;
  float pos_z;

  float time;
} RayTracer;

extern void RayTracerInit(RayTracer*, const char*);
extern void RayTracerUpdate(
  RayTracer*, int, int, float, float, int, int, float
);
extern void RayTracerUse(RayTracer*);
extern void RayTracerRender(RayTracer*);

#endif
