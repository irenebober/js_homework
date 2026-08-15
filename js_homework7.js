const text = "Wonderful, Joyful, Happiness, Time, Task, Apple";
const pattern = /\b[b-z]{6,}\b/gi; 
// const pattern = /\b[b-zB-Z]{6,}\b/g; 

const result = text.match(pattern);
console.log(result);