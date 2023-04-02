#include "exports.h"

#include "imports.h"
#include "raytracer.h"

static int width, height;
void resize(int new_w, int new_h) {
  width = new_w;
  height = new_h;
  glViewport(0, 0, new_w, new_h);
}

static float mouse_x, mouse_y;
void update_mouse(float new_x, float new_y) {
  mouse_x = new_x;
  mouse_y = height - new_y;
}

static RayTracer raytracer;

void game_init(void) {
  glEnable(GL_DEPTH_TEST);
  RayTracerInit(&raytracer);
}

static float time = 0;
void game_update(float dt) {
  RayTracerUse(&raytracer);
  RayTracerUpdate(&raytracer, width, height, mouse_x, mouse_y, time);

  time += dt;
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  RayTracerRender(&raytracer);
}
