// Вопросы по математике — 15 на каждую группу, 5 раундов
const questionsByAge = {
  young: [
    { a: 2, b: 3, op: '+', answer: 5 },
    { a: 4, b: 1, op: '+', answer: 5 },
    { a: 3, b: 3, op: '+', answer: 6 },
    { a: 5, b: 2, op: '+', answer: 7 },
    { a: 1, b: 6, op: '+', answer: 7 },
    { a: 4, b: 4, op: '+', answer: 8 },
    { a: 6, b: 2, op: '-', answer: 4 },
    { a: 8, b: 3, op: '-', answer: 5 },
    { a: 7, b: 4, op: '-', answer: 3 },
    { a: 5, b: 1, op: '+', answer: 6 },
    { a: 2, b: 2, op: '+', answer: 4 },
    { a: 9, b: 3, op: '-', answer: 6 },
    { a: 3, b: 4, op: '+', answer: 7 },
    { a: 6, b: 1, op: '+', answer: 7 },
    { a: 5, b: 3, op: '-', answer: 2 },
  ],
  middle: [
    { a: 15, b: 7,  op: '-', answer: 8  },
    { a: 6,  b: 3,  op: '×', answer: 18 },
    { a: 20, b: 4,  op: '÷', answer: 5  },
    { a: 12, b: 8,  op: '+', answer: 20 },
    { a: 18, b: 9,  op: '-', answer: 9  },
    { a: 4,  b: 4,  op: '×', answer: 16 },
    { a: 24, b: 6,  op: '÷', answer: 4  },
    { a: 13, b: 7,  op: '+', answer: 20 },
    { a: 5,  b: 5,  op: '×', answer: 25 },
    { a: 16, b: 8,  op: '÷', answer: 2  },
    { a: 7,  b: 3,  op: '×', answer: 21 },
    { a: 30, b: 5,  op: '÷', answer: 6  },
    { a: 14, b: 6,  op: '+', answer: 20 },
    { a: 22, b: 8,  op: '-', answer: 14 },
    { a: 3,  b: 9,  op: '×', answer: 27 },
  ],
  senior: [
    { a: 24,  b: 4,  op: '÷', answer: 6  },
    { a: 13,  b: 28, op: '+', answer: 41 },
    { a: 7,   b: 8,  op: '×', answer: 56 },
    { a: 45,  b: 9,  op: '÷', answer: 5  },
    { a: 36,  b: 17, op: '-', answer: 19 },
    { a: 9,   b: 9,  op: '×', answer: 81 },
    { a: 63,  b: 7,  op: '÷', answer: 9  },
    { a: 25,  b: 38, op: '+', answer: 63 },
    { a: 6,   b: 7,  op: '×', answer: 42 },
    { a: 72,  b: 8,  op: '÷', answer: 9  },
    { a: 48,  b: 6,  op: '÷', answer: 8  },
    { a: 34,  b: 19, op: '+', answer: 53 },
    { a: 8,   b: 7,  op: '×', answer: 56 },
    { a: 81,  b: 9,  op: '÷', answer: 9  },
    { a: 57,  b: 28, op: '-', answer: 29 },
  ],
};

export function getAgeGroup(age) {
  const n = parseInt(age, 10);
  if (n <= 8) return 'young';
  if (n <= 10) return 'middle';
  return 'senior';
}

export function getQuestions(age, count = 5) {
  const group = getAgeGroup(age);
  const pool = [...questionsByAge[group]];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((q) => {
    const wrong1 = q.answer + (Math.random() < 0.5 ? 1 : -1);
    let wrong2 = q.answer + (Math.random() < 0.5 ? 2 : -2);
    if (wrong2 === wrong1) wrong2 += 1;
    if (wrong2 === q.answer) wrong2 += 3;
    const options = [q.answer, Math.max(1, wrong1), Math.max(1, wrong2)]
      .sort(() => Math.random() - 0.5);
    return { ...q, options };
  });
}

export const ageTitles = {
  young:  'Лёгкий уровень ⭐',
  middle: 'Средний уровень ⭐⭐',
  senior: 'Сложный уровень 🔥',
};
