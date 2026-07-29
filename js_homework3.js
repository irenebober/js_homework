export function pow(x, y) {
  let result = 1;

  for (let count = 1; count <= y; count++) { //поменяла i на count, чтоб мне было понятнее
result = result*x;
  }

  return result;
}
console.log(pow(2, 3));