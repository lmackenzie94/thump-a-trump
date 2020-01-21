// function to get a random amount of time
export function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
