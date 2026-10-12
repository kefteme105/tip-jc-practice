"use strict";

console.log(" №1 ");
console.log("Результат:", "8" + 2);
console.log("Тип результата:", typeof ("8" + 2));

console.log(" №2 ");
console.log("Результат:", "8" - 2);
console.log("Тип результата:", typeof ("8" - 2));

console.log(" №3 ");
console.log("Результат:", Number("8") + 2);
console.log("Тип результата:", typeof (Number("8") + 2));

console.log(" №4 ");
console.log("Результат:", "12" > "3");
console.log("Тип результата:", typeof ("12" > "3"));

console.log(" №5 ");
console.log("Результат:", 12 === "12");
console.log("Тип результата:", typeof (12 === "12"));


console.log(" №6 ");
console.log("Результат:", Number(""));
console.log("Тип результата:", typeof Number(""));

console.log(" №7 ");
console.log("Результат:", Number("text"));
console.log("Тип результата:", typeof Number("text"));

console.log(" №8 ");
console.log("Результат:", Boolean("false"));
console.log("Тип результата:", typeof Boolean("false"));

console.log(" №9 ");
const val9 = typeof null;
console.log("Значение typeof null:", val9);
console.log("Тип самого результата typeof null:", typeof val9);

console.log(" №10 ");
const val10 = typeof NaN;
console.log("Значение typeof NaN:", val10);
console.log("Тип самого результата typeof NaN:", typeof val10);