float rand(inout uint state) {
	state = state * 747796405u + 2891336453u;
	uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
	uint result = (word >> 22u) ^ word;
  return float(result) / float(4294967295u);
}

float normal_dist(inout uint state) {
  float theta = radians(360.0) * rand(state);
  float rho = sqrt(-2.0 * log(rand(state)));
  return rho * cos(theta);
}

vec3 random_dir(inout uint state) {
  vec3 result = vec3(normal_dist(state), normal_dist(state), normal_dist(state));
  return normalize(result);
}

uint get_seed() {
  uint state = uint(gl_FragCoord.x + u_resolution.x * gl_FragCoord.y);
  // return state; // static noise
  rand(state);
  return state + uint(u_time * 1000.0f); // dynamic noise
}
