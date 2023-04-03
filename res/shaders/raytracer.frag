#version 300 es

#ifdef GL_ES
precision highp float;
#endif

#define FOV 70.0

uniform vec2 u_resolution;
uniform vec2 u_angle;
uniform vec3 u_origin;

out vec4 frag_color;

struct material_t {
  vec4 color;
};

struct ray_t {
  vec3 origin;
  vec3 dir;
  float length;
  material_t hit_mat;
  vec3 hit_normal;
};

struct sphere_t {
  vec3 center;
  float radius;
  material_t mat;
};

vec3 get_ray_direction() {
  vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;

  vec2 plane;
  
  plane.y = tan(radians(FOV * 0.5)) * 2.0;
  plane.x = plane.y * u_resolution.x / u_resolution.y;

  vec2 sin_angle = sin(u_angle);
  vec2 cos_angle = cos(u_angle);

  // No normalization required because all of them are unit vectors
  vec3 dir = vec3(sin_angle.x * cos_angle.y, sin_angle.y, cos_angle.x * cos_angle.y);
  vec3 side = normalize(vec3(cos_angle.x, 0.0, -sin_angle.x));
  vec3 up = cross(dir, side);

  // I refuse to use matrix
  vec2 coord = uv * plane;

  return normalize(dir + side * coord.x + up * coord.y);
}

void intersect_sphere(inout ray_t ray, sphere_t sphere) {
  vec3 va = ray.origin - sphere.center;

  float a = dot(ray.dir, ray.dir);
  float b = 2.0 * dot(va, ray.dir);
  float c = dot(va, va) - sphere.radius * sphere.radius;

  float delta = b * b - 4.0 * a * c;
  
  if (delta >= 0.0) {
    float t = (-b - sqrt(delta)) / 2.0 * a;

    vec3 n = normalize(va + ray.dir * t);

    if (t > 0.0 && (ray.length < 0.0 || ray.length > t)) {
      ray.length = t;
      ray.hit_mat = sphere.mat;
      ray.hit_normal = n;
    } 
  }
}

void intersect_environment(inout ray_t ray) {
  float t = -ray.origin.y / ray.dir.y;
  if (t > 0.0 && (ray.length < 0.0 || ray.length > t)) {
    ray.length = t;
    vec3 hit = ray.origin + ray.dir * ray.length;
    int tile = int(hit.x) + int(hit.z) + int(hit.x < 0.0) + int(hit.z < 0.0);

    if (tile % 2 == 0) ray.hit_mat.color = vec4(0.8, 0.8, 0.8, 1.0);
    else ray.hit_mat.color = vec4(0.6, 0.6, 0.6, 1.0);
    ray.hit_normal = vec3(0.0, 1.0, 0.0);
  }
}

vec3 sky_gradient(ray_t ray) {
  float t = 0.5 * (ray.dir.y + 1.0);

  return (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

void main() {
  ray_t ray;
  ray.origin = u_origin;
  ray.dir = get_ray_direction();
  ray.length = -1.0;

  material_t red = material_t(vec4(1.0, 0.0, 0.0, 1.0));
  material_t green = material_t(vec4(0.0, 1.0, 0.0, 1.0));
  material_t blue = material_t(vec4(0.0, 0.0, 1.0, 1.0));

  sphere_t sphere1 = sphere_t(vec3(3.0, 1.5, 3.0), 1.0, red);
  sphere_t sphere2 = sphere_t(vec3(0.0, 0.75, 3.0), 1.0, green);
  sphere_t sphere3 = sphere_t(vec3(-3.0, 2.25, 3.0), 1.0, blue);

  intersect_sphere(ray, sphere1);
  intersect_sphere(ray, sphere2);
  intersect_sphere(ray, sphere3);

  intersect_environment(ray);

  if (ray.length >= 0.0) frag_color = ray.hit_mat.color;
  else frag_color = vec4(sky_gradient(ray), 1.0);
}
