// Функция для проверки введенного текста на допустимые символы в зависимости от выбранного языка
function validateInput(text, lang) {
    // Регулярное выражение для проверки текста на допустимые символы
    const validChars = lang === "russian" ? /^[а-яА-ЯёЁ\s]+$/ : /^[a-zA-Z\s]+$/;
    // Если текст не соответствует допустимым символам, выводим предупреждение
    if (!validChars.test(text)) {
        alert(`ВНИМАНИЕ, ОШИБКА: текст содержит символы,которые к выбранному вами языку, не относятся (${lang === "russian" ? "русский" : "английский"}).`);
        return false; // Возвращаем false, чтобы предотвратить дальнейшую обработку
    }
    return true; // Возвращаем true, если все символы допустимы
}

// Функция для создания матрицы из ключа
function createMatrix(key, lang) {
    // Определяем алфавит в зависимости от выбранного языка
    const alphabet = lang === "russian" ? "абвгдежзийклмнопрстуфхцчшщъыьэюя" : "abcdefghijklmnopqrstuvwxyz";
    // Убираем неалфавитные символы из ключа и оставляем только уникальные символы
    const uniqueKey = Array.from(new Set(key.replace(/[^a-zа-яё]/gi, "").toLowerCase()));
    // Создаем матрицу: сначала уникальные символы из ключа, затем оставшиеся буквы алфавита
    const matrix = uniqueKey.concat(alphabet.split("").filter(char => !uniqueKey.includes(char)));
    // Ограничиваем матрицу длиной 36 (для русского языка) или 25 (для английского)
    return matrix.slice(0, lang === "russian" ? 36 : 25);
}

// Функция для отображения матрицы на экране
function displayMatrix(matrix, lang) {
    const matrixContainer = document.getElementById("matrix");
    matrixContainer.innerHTML = ""; // Очищаем контейнер для матрицы
    // Определяем размер матрицы в зависимости от языка
    const size = lang === "russian" ? 6 : 5;
    // Для каждого символа в матрице создаем div и добавляем его в контейнер
    matrix.forEach((char, index) => {
        const cell = document.createElement("div");
        cell.textContent = char.toUpperCase(); // Преобразуем символ в верхний регистр
        matrixContainer.appendChild(cell); // Добавляем ячейку в контейнер
    });
}

// Функция для обработки текста с учетом регистра
function processTextWithCase(text, matrix, lang, mode) {
    const size = lang === "russian" ? 6 : 5; // Размер матрицы в зависимости от языка
    let bigrams = []; // Массив биграмм для обработки текста
    let result = []; // Массив для результата
    let lowerText = text.toLowerCase(); // Преобразуем весь текст в нижний регистр для обработки
    let caseMap = Array.from(text).map(char => (char === char.toUpperCase() ? "U" : "L")); // Массив для хранения информации о регистре каждого символа

    // Убираем все символы, не относящиеся к алфавиту, и разбиваем текст на символы
    lowerText = lowerText.replace(/[^a-zа-яё]/gi, "").split("");

    // Формируем биграммы (пары символов) из текста
    for (let i = 0; i < lowerText.length; i += 2) {
        let a = lowerText[i];
        let b = lowerText[i + 1] || (lang === "russian" ? "ъ" : "x"); // Если второй символ отсутствует, заменяем его на 'ъ' или 'x'
        if (a === b) b = lang === "russian" ? "ъ" : "x"; // Если символы одинаковые, заменяем второй символ на 'ъ' или 'x'
        bigrams.push([a, b]); // Добавляем пару символов в биграмму
    }

    // Обрабатываем каждую биграмму
    bigrams.forEach(([a, b]) => {
        let idxA = matrix.indexOf(a); // Находим индекс первого символа в матрице
        let idxB = matrix.indexOf(b); // Находим индекс второго символа в матрице

        // Если один из символов не найден в матрице, оставляем его как есть
        if (idxA === -1 || idxB === -1) {
            result.push(a + b);
            return;
        }

        // Находим координаты (строку и колонку) для каждого символа
        let rowA = Math.floor(idxA / size),
            colA = idxA % size;
        let rowB = Math.floor(idxB / size),
            colB = idxB % size;

        // Если символы находятся в одной строке, сдвигаем их по колонкам
        if (rowA === rowB) {
            colA = (colA + (mode === "encrypt" ? 1 : -1) + size) % size;
            colB = (colB + (mode === "encrypt" ? 1 : -1) + size) % size;
        }
        // Если символы находятся в одном столбце, сдвигаем их по строкам
        else if (colA === colB) {
            rowA = (rowA + (mode === "encrypt" ? 1 : -1) + size) % size;
            rowB = (rowB + (mode === "encrypt" ? 1 : -1) + size) % size;
        }
        // Если символы находятся в разных строках и колонках, меняем их местами
        else {
            [colA, colB] = [colB, colA];
        }

        // Добавляем преобразованные символы в результат
        result.push(matrix[rowA * size + colA] + matrix[rowB * size + colB]);
    });

    // Восстанавливаем регистр исходного текста и возвращаем результат
    return result.join("").split("").map((char, index) => (caseMap[index] === "U" ? char.toUpperCase() : char)).join("");
}

// Функция для шифрования текста
function encryptText() {
    const key = document.getElementById("key").value; // Получаем ключ из поля ввода
    const text = document.getElementById("text").value; // Получаем текст для шифрования
    const lang = document.querySelector("input[name='language']:checked").value; // Получаем выбранный язык

    // Проверяем, что введенный текст соответствует правилам для выбранного языка
    if (!validateInput(text, lang)) return;

    const matrix = createMatrix(key, lang); // Создаем матрицу для шифрования
    displayMatrix(matrix, lang); // Отображаем матрицу на странице
    const result = processTextWithCase(text, matrix, lang, "encrypt"); // Шифруем текст
    document.getElementById("result").value = result; // Выводим результат в поле "result"
}

// Функция для дешифрования текста
function decryptText() {
    const key = document.getElementById("key").value; // Получаем ключ из поля ввода
    const text = document.getElementById("text").value; // Получаем текст для дешифрования
    const lang = document.querySelector("input[name='language']:checked").value; // Получаем выбранный язык

    // Проверяем, что введенный текст соответствует правилам для выбранного языка
    if (!validateInput(text, lang)) return;

    const matrix = createMatrix(key, lang); // Создаем матрицу для дешифрования
    displayMatrix(matrix, lang); // Отображаем матрицу на странице
    const result = processTextWithCase(text, matrix, lang, "decrypt"); // Дешифруем текст
    document.getElementById("result").value = result; // Выводим результат в поле "result"
}
