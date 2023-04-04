#include "exports.h"

#include "imports.h"
#include "raytracer.h"

static int width, height;
void resize(int new_w, int new_h) {
  width = new_w;
  height = new_h;
  glViewport(0, 0, new_w, new_h);
}

static float mouse_x = 0, mouse_y = 0;
void update_mouse(float new_x, float new_y) {
  mouse_x = new_x;
  mouse_y = height - new_y;
}

static int input_x = 0, input_y = 0;
void key_pressed(char key) {
  switch (key) {
    case 'W': input_y++; break;
    case 'S': input_y--; break;
    case 'A': input_x--; break;
    case 'D': input_x++; break;
    default: break;
  }

  input_x = min(input_x, 1);
  input_y = min(input_y, 1);

  input_x = max(input_x, -1);
  input_y = max(input_y, -1);
}

void key_released(char key) {
  switch (key) {
    case 'W': input_y--; break;
    case 'S': input_y++; break;
    case 'A': input_x++; break;
    case 'D': input_x--; break;
    default: break;
  }

  input_x = min(input_x, 1);
  input_y = min(input_y, 1);

  input_x = max(input_x, -1);
  input_y = max(input_y, -1);
}

static RayTracer raytracer;

void game_init(const char* shader) {
  glEnable(GL_DEPTH_TEST);
  RayTracerInit(&raytracer, shader);
}

void game_update(float dt) {
  RayTracerUse(&raytracer);
  RayTracerUpdate(
    &raytracer, width, height, mouse_x, mouse_y, input_x, input_y, dt
  );

  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  RayTracerRender(&raytracer);
}
