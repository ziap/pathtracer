void hit_floor(inout ray_t ray) {
  // Plane equation: ((ro + rd*t) * n) - d = 0
  // Floor normal: n = (0, 1, 0)
  // Floor distance to origin: d = 0
  // => (ro + rd*t).y = 0

  // Solve for t:
  // ro.y + rd.y*t = 0
  // t = -ro.y / rd.y
  if (ray.dir.y >= 0.0) return;
  float t = min(-ray.origin.y / ray.dir.y, VERY_FAR - 1.0);

  if (t > 0.0 && ray.length > t) {
    ray.length = t;
    vec3 hit = ray.origin + ray.dir * ray.length;
    ray.hit_normal = vec3(0.0, 1.0, 0.0);

    int tile = int(hit.x) + int(hit.z) + int(hit.x < 0.0) + int(hit.z < 0.0);

    if (tile % 2 == 0) ray.hit_id = -1;
    else ray.hit_id = -2;
  }
}

struct sphere_t {
  vec3 center;
  float radius;
  int id;
};

void hit_sphere(inout ray_t ray, sphere_t sphere) {
  // Sphere equation: (ro + t*rd - center)^2 = r^2

  // let va = ro - center
  // (va + t*rd)^2 = r^2
  vec3 va = ray.origin - sphere.center;

  // va^2 + 2*t*rd*va + t^2*rd^2 = r^2
  // rd^2*t^2 + 2*va*rd*t + va^2 - r^2 = 0
  // ^^^^       ^^^^^^^     ^^^^^^^^^^
  //   a           b             c
  float a = dot(ray.dir, ray.dir);
  float b = 2.0 * dot(va, ray.dir);
  float c = dot(va, va) - sphere.radius * sphere.radius;

  // Solve for t using quadratic formula
  float delta = b * b - 4.0 * a * c;
  
  if (delta >= 0.0) {
    // Always choose the closer distance
    float t = (-b - sqrt(delta)) / (2.0 * a);

    // ro + rd*t - center = va + rd*t
    vec3 n = normalize(va + ray.dir * t);

    if (t > 0.0 && ray.length > t) {
      ray.length = t;
      ray.hit_id = sphere.id;
      ray.hit_normal = n;
    } 
  }
}

// TODO: AABB (more important because VBH)
// TODO: Triangle
