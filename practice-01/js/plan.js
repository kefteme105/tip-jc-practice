"use strict";

const totalTasks = 14;
const completedTasks = 4;
const dailyLimit = 4;


if (
  typeof totalTasks !== "number" ||
  typeof completedTasks !== "number" ||
  typeof dailyLimit !== "number"
) {
  console.log("Ошибка: Все входные данные должны быть числами");
}

else if (
  totalTasks < 0 ||
  completedTasks < 0 ||
  !Number.isInteger(totalTasks) ||
  !Number.isInteger(completedTasks) ||
  completedTasks > totalTasks
) {
  console.log("Ошибка: Некорректное число выполненных или общих задач");
}
else if (
  !Number.isInteger(dailyLimit) ||
  dailyLimit < 1 ||
  dailyLimit > 1000
) {
  console.log("Ошибка: Некорректный дневной лимит tasks (должно быть целое число от 1 до 1000)");
}
else {
  let remainingTasks = totalTasks - completedTasks;
  console.log(`Осталось задач: ${remainingTasks}`);

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
  } else {
    let day = 0;

    while (remainingTasks > 0) {
      day++;
      const tasksToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksToday;

      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}