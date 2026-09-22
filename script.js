const feed = document.getElementById("puzzleFeed");
const scoreElement = document.getElementById("score");
const streakElement = document.getElementById("streak");
const solvedElement = document.getElementById("solved");
const loading = document.getElementById("loading");

let score = 0;
let streak = 0;
let solved = 0;
let loadingMore = false;
let puzzleId = 0;


/* =========================================
   SAVE / LOAD PROGRESS
========================================= */

function saveProgress() {
    localStorage.setItem("puzzleflow-score", score);
    localStorage.setItem("puzzleflow-streak", streak);
    localStorage.setItem("puzzleflow-solved", solved);
}

function loadProgress() {
    score = Number(localStorage.getItem("puzzleflow-score")) || 0;
    streak = Number(localStorage.getItem("puzzleflow-streak")) || 0;
    solved = Number(localStorage.getItem("puzzleflow-solved")) || 0;

    updateStats();
}

function updateStats() {
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    solvedElement.textContent = solved;
}


/* =========================================
   RANDOM HELPERS
========================================= */

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
    return array[random(0, array.length - 1)];
}

function shuffle(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function normalize(answer) {
    return String(answer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


/* =========================================
   QUESTION BAGS
========================================= */

let anagramBag = [];
let riddleBag = [];
let logicBag = [];
let aptitudeBag = [];
let detectiveBag = [];
let zebraBag = [];
let codeBreakerBag = [];

let puzzleTypeBag = [];


function getNextQuestion(questionList, bagName) {

    let bag;

    if (bagName === "anagram") {
        bag = anagramBag;
    }

    else if (bagName === "riddle") {
        bag = riddleBag;
    }

    else if (bagName === "logic") {
        bag = logicBag;
    }

    else if (bagName === "aptitude") {
        bag = aptitudeBag;
    }

    else if (bagName === "detective") {
        bag = detectiveBag;
    }

    else if (bagName === "zebra") {
        bag = zebraBag;
    }

    else if (bagName === "codebreaker") {
        bag = codeBreakerBag;
    }

    if (!bag) {
        return randomItem(questionList);
    }

    if (bag.length === 0) {
        bag.push(...shuffle(questionList));
    }

    return bag.pop();
}


/* =========================================
   SUDOKU
========================================= */

function createSudokuPuzzle() {

    /*
       6 × 6 Sudoku

       Each row has exactly 2 blank cells.
       This prevents the blank cells from
       collecting together in the first rows.
    */

    const solution = [
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [2, 3, 4, 5, 6, 1],
        [5, 6, 1, 2, 3, 4],
        [3, 4, 5, 6, 1, 2],
        [6, 1, 2, 3, 4, 5]
    ];

    const puzzle = solution.map(row => [...row]);

    /*
       Remove exactly 2 cells from every row.
       Therefore every row contains:
       4 numbers + 2 empty cells.
    */

    for (let row = 0; row < 6; row++) {

        const positions = shuffle([
            0, 1, 2, 3, 4, 5
        ]);

        puzzle[row][positions[0]] = 0;
        puzzle[row][positions[1]] = 0;
    }

    return {
        type: "sudoku",
        category: "Sudoku",
        difficulty: "Medium",
        title: "Sudoku",
        question: "Fill in the missing numbers.",
        puzzle: puzzle,
        solution: solution
    };
}


/* =========================================
   WORD SEARCH
========================================= */

const wordSearchThemes = [

    {
        theme: "ANIMALS",
        words: [
            "TIGER",
            "LION",
            "HORSE",
            "ZEBRA",
            "PANDA"
        ]
    },

    {
        theme: "NATURE",
        words: [
            "RIVER",
            "TREE",
            "PLANT",
            "CLOUD",
            "STONE"
        ]
    },

    {
        theme: "FOOD",
        words: [
            "APPLE",
            "PIZZA",
            "BREAD",
            "MANGO",
            "RICE"
        ]
    },

    {
        theme: "SPORTS",
        words: [
            "CRICKET",
            "TENNIS",
            "SOCCER",
            "RUN",
            "GOAL"
        ]
    },

    {
        theme: "FASHION",
        words: [
            "SHIRT",
            "DRESS",
            "SHOE",
            "JEANS",
            "SKIRT"
        ]
    }
];


function createEmptyWordGrid() {

    return Array.from(
        { length: 6 },
        () => Array(6).fill("")
    );
}


function canPlaceWord(grid, word, row, col, dr, dc) {

    for (let i = 0; i < word.length; i++) {

        const r = row + dr * i;
        const c = col + dc * i;

        if (
            r < 0 ||
            r >= 6 ||
            c < 0 ||
            c >= 6
        ) {
            return false;
        }

        if (
            grid[r][c] !== "" &&
            grid[r][c] !== word[i]
        ) {
            return false;
        }
    }

    return true;
}


function placeWord(grid, word) {

    const directions = shuffle([
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1]
    ]);

    for (const [dr, dc] of directions) {

        for (let attempt = 0; attempt < 100; attempt++) {

            const row = random(0, 5);
            const col = random(0, 5);

            if (
                canPlaceWord(
                    grid,
                    word,
                    row,
                    col,
                    dr,
                    dc
                )
            ) {

                const cells = [];

                for (let i = 0; i < word.length; i++) {

                    const r = row + dr * i;
                    const c = col + dc * i;

                    grid[r][c] = word[i];

                    cells.push({
                        row: r,
                        col: c
                    });
                }

                return {
                    word: word,
                    cells: cells
                };
            }
        }
    }

    return null;
}


function createWordSearchPuzzle() {

    const selectedTheme = randomItem(wordSearchThemes);

    let words = selectedTheme.words
        .filter(word => word.length <= 6)
        .map(word => word.toUpperCase());

    words = shuffle(words).slice(0, 3);

    let grid;
    let placements;

    let success = false;

    for (let attempt = 0; attempt < 50; attempt++) {

        grid = createEmptyWordGrid();
        placements = {};

        success = true;

        for (const word of words) {

            const placement = placeWord(
                grid,
                word
            );

            if (!placement) {
                success = false;
                break;
            }

            placements[word] = placement.cells;
        }

        if (success) {
            break;
        }
    }

    if (!success) {
        return createWordSearchPuzzle();
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            if (grid[row][col] === "") {

                grid[row][col] =
                    alphabet[random(0, alphabet.length - 1)];
            }
        }
    }

    return {
        type: "wordsearch",
        category: "Word Search",
        difficulty: "Medium",
        title: "Word Search",
        question: "Find all the hidden words.",
        theme: selectedTheme.theme,
        grid: grid,
        words: words,
        placements: placements
    };
}


/* =========================================
   ANAGRAM
========================================= */

const anagramQuestions = [

    ["ELPPA", "apple"],
    ["RATWE", "water"],
    ["RTAEH", "heart"],
    ["NOHTPY", "python"],
    ["RETUPMOC", "computer"],
    ["LOOHCS", "school"],
    ["REWOLF", "flower"],
    ["NEDRAG", "garden"],
    ["RETUPMO", "computer"],
    ["REHTOM", "mother"],
    ["REHTAF", "father"],
    ["LOOHCS", "school"]
];


function createAnagramPuzzle() {

    const selected = getNextQuestion(
        anagramQuestions,
        "anagram"
    );

    return {
        type: "normal",
        category: "Words",
        difficulty: "Easy",
        title: "Anagram",
        question: "Unscramble the letters to form a word.",
        display: selected[0],
        answer: selected[1]
    };
}


/* =========================================
   RIDDLES
========================================= */

const riddleQuestions = [

    {
        question:
            "I have keys but no locks. I have space but no room. What am I?",
        answer: "keyboard"
    },

    {
        question:
            "What has hands but cannot clap?",
        answer: "clock"
    },

    {
        question:
            "What gets wetter as it dries?",
        answer: "towel"
    },

    {
        question:
            "What has a face and two hands but no arms or legs?",
        answer: "clock"
    },

    {
        question:
            "What has many teeth but cannot bite?",
        answer: "comb"
    },

    {
        question:
            "What has one eye but cannot see?",
        answer: "needle"
    },

    {
        question:
            "What has a neck but no head?",
        answer: "bottle"
    },

    {
        question:
            "What can travel around the world while staying in one corner?",
        answer: "stamp"
    }
];


function createRiddlePuzzle() {

    const selected = getNextQuestion(
        riddleQuestions,
        "riddle"
    );

    return {
        type: "normal",
        category: "Words",
        difficulty: "Medium",
        title: "Riddle",
        question: selected.question,
        display: "Think carefully...",
        answer: selected.answer
    };
}


/* =========================================
   LOGIC
========================================= */

const logicQuestions = [

    {
        question:
            "A is taller than B. B is taller than C. Who is the shortest?",
        display: "A > B > C",
        answer: "c"
    },

    {
        question:
            "If all cats are animals and Tom is a cat, what is Tom?",
        display: "Cats → Animals",
        answer: "animal"
    },

    {
        question:
            "A clock shows 3:00. What angle is between the hands?",
        display: "3:00",
        answer: "90"
    },

    {
        question:
            "If Monday is the first day, what day is the fourth day?",
        display: "Monday → ?",
        answer: "thursday"
    },

    {
        question:
            "A basket has 5 apples. You take 2. How many apples do you have?",
        display: "5 − 2",
        answer: "2"
    },

    {
        question:
            "If X comes before Y and Y comes before Z, which comes last?",
        display: "X → Y → Z",
        answer: "z"
    },

    {
        question:
            "A is older than B. B is older than C. Who is the youngest?",
        display: "A > B > C",
        answer: "c"
    },

    {
        question:
            "What comes next: A, C, E, G, ?",
        display: "A → C → E → G → ?",
        answer: "i"
    }
];


function createLogicPuzzle() {

    const selected = getNextQuestion(
        logicQuestions,
        "logic"
    );

    return {
        type: "normal",
        category: "Logic",
        difficulty: "Medium",
        title: "Logic Puzzle",
        question: selected.question,
        display: selected.display,
        answer: selected.answer
    };
}


/* =========================================
   APTITUDE
========================================= */

const aptitudeQuestions = [

    {
        question:
            "A train travels at 60 km/h for 2 hours. How far does it travel?",
        display:
            "Distance = Speed × Time",
        answer: "120"
    },

    {
        question:
            "Two numbers are in the ratio 2:3. Their total is 25. What is the first number?",
        display:
            "Ratio = 2 : 3<br>Total = 25",
        answer: "10"
    },

    {
        question:
            "A father is 3 times as old as his son. Their total age is 48. How old is the son?",
        display:
            "Father = 3 × Son<br>Total = 48",
        answer: "12"
    },

    {
        question:
            "What is 20% of 150?",
        display:
            "20% × 150",
        answer: "30"
    },

    {
        question:
            "A product costs ₹500. It is sold at a 10% discount. What is the selling price?",
        display:
            "₹500 − 10%",
        answer: "450"
    },

    {
        question:
            "A car travels 240 km in 4 hours. What is its speed?",
        display:
            "Speed = Distance ÷ Time",
        answer: "60"
    },

    {
        question:
            "What is the smaller angle between the clock hands at 3:00?",
        display:
            "3:00",
        answer: "90"
    },

    {
        question:
            "A box contains 3 red balls and 2 blue balls. What is the probability of picking a red ball?",
        display:
            "Red = 3<br>Blue = 2",
        answer: "3/5"
    }
];


function createAptitudePuzzle() {

    const selected = getNextQuestion(
        aptitudeQuestions,
        "aptitude"
    );

    return {
        type: "normal",
        category: "Aptitude",
        difficulty: "Medium",
        title: "Aptitude",
        question: selected.question,
        display: selected.display,
        answer: selected.answer
    };
}


/* =========================================
   DETECTIVE
========================================= */

const detectiveQuestions = [

    {
        question:
            "A phone was stolen. Alice says Bob stole it. Bob says Carol stole it. Carol says Bob is lying. Exactly one statement is true. Who stole the phone?",
        display:
            "Alice → Bob<br>Bob → Carol<br>Carol → Bob is lying",
        answer: "alice"
    },

    {
        question:
            "A wallet disappeared. Ravi says Maya took it. Maya says Arjun took it. Arjun says Maya is lying. Exactly one statement is true. Who took the wallet?",
        display:
            "Ravi → Maya<br>Maya → Arjun<br>Arjun → Maya is lying",
        answer: "maya"
    },

    {
        question:
            "Three people are suspects. Alex says Ben did it. Ben says Alex did it. Chris says Ben is lying. Exactly one statement is true. Who did it?",
        display:
            "Alex → Ben<br>Ben → Alex<br>Chris → Ben is lying",
        answer: "ben"
    },

    {
        question:
            "A laptop disappeared. Sam says Tina took it. Tina says Sam is lying. Raj says Tina took it. Exactly one statement is true. Who took it?",
        display:
            "Sam → Tina<br>Tina → Sam is lying<br>Raj → Tina",
        answer: "sam"
    },

    {
        question:
            "A book disappeared. Asha says Bina took it. Bina says Chitra took it. Chitra says Asha is lying. Exactly one statement is true. Who took the book?",
        display:
            "Asha → Bina<br>Bina → Chitra<br>Chitra → Asha is lying",
        answer: "asha"
    },

    {
        question:
            "A key disappeared. Dev says Esha took it. Esha says Farhan took it. Farhan says Dev is lying. Exactly one statement is true. Who took the key?",
        display:
            "Dev → Esha<br>Esha → Farhan<br>Farhan → Dev is lying",
        answer: "dev"
    }
];


function createDetectivePuzzle() {

    const selected = getNextQuestion(
        detectiveQuestions,
        "detective"
    );

    return {
        type: "normal",
        category: "Detective",
        difficulty: "Hard",
        title: "Detective Puzzle",
        question: selected.question,
        display: selected.display,
        answer: selected.answer
    };
}


/* =========================================
   ZEBRA
========================================= */

const zebraQuestions = [

    {
        question:
            "Three friends Ravi, Anu and Sara each like a different sport: Cricket, Tennis and Football. Ravi likes Cricket. Anu does not like Football. What sport does Sara like?",
        display:
            "Ravi = Cricket<br>Anu ≠ Football<br>Sports = Cricket, Tennis, Football",
        answer: "football"
    },

    {
        question:
            "Three students A, B and C have different favorite colors: Red, Blue and Green. A likes Red. B does not like Green. What color does C like?",
        display:
            "A = Red<br>B ≠ Green",
        answer: "green"
    },

    {
        question:
            "Three people Ravi, Priya and Neha have different pets: Dog, Cat and Fish. Ravi has the Dog. Priya does not have the Fish. What pet does Neha have?",
        display:
            "Ravi = Dog<br>Priya ≠ Fish",
        answer: "fish"
    },

    {
        question:
            "Three students have different favorite subjects: Math, Science and English. A likes Math. B does not like English. What subject does C like?",
        display:
            "A = Math<br>B ≠ English",
        answer: "english"
    },

    {
        question:
            "Three friends have different favorite fruits: Apple, Mango and Banana. Ravi likes Apple. Priya does not like Banana. What fruit does Neha like?",
        display:
            "Ravi = Apple<br>Priya ≠ Banana",
        answer: "banana"
    },

    {
        question:
            "Three people live in different houses: Red, Blue and Green. A lives in Red. B does not live in Green. What color house does C live in?",
        display:
            "A = Red<br>B ≠ Green",
        answer: "green"
    }
];


function createZebraPuzzle() {

    const selected = getNextQuestion(
        zebraQuestions,
        "zebra"
    );

    return {
        type: "normal",
        category: "Zebra",
        difficulty: "Hard",
        title: "Zebra Puzzle",
        question: selected.question,
        display: selected.display,
        answer: selected.answer
    };
}


/* =========================================
   CODE BREAKER
========================================= */

const codeBreakerQuestions = [

    {
        question:
            "Find the 3-digit code.<br><br>" +
            "682 → One digit is correct and correctly placed.<br>" +
            "614 → One digit is correct but wrongly placed.<br>" +
            "206 → Two digits are correct but wrongly placed.<br>" +
            "738 → No digit is correct.<br>" +
            "780 → One digit is correct but wrongly placed.",
        display: "Enter the 3-digit code.",
        answer: "042"
    },

    {
        question:
            "Find the 3-digit code.<br><br>" +
            "682 → One digit is correct and correctly placed.<br>" +
            "614 → One digit is correct but wrongly placed.<br>" +
            "206 → Two digits are correct but wrongly placed.<br>" +
            "738 → No digit is correct.<br>" +
            "780 → One digit is correct but wrongly placed.",
        display: "Enter the 3-digit code.",
        answer: "042"
    },

    {
        question:
            "A 3-digit code has these clues:<br><br>" +
            "123 → One digit is correct and correctly placed.<br>" +
            "456 → One digit is correct but wrongly placed.<br>" +
            "789 → No digit is correct.<br>" +
            "530 → One digit is correct but wrongly placed.",
        display: "Enter the code.",
        answer: "153"
    },

    {
        question:
            "Find the secret 3-digit code.<br><br>" +
            "583 → One digit is correct and correctly placed.<br>" +
            "781 → One digit is correct but wrongly placed.<br>" +
            "920 → One digit is correct but wrongly placed.<br>" +
            "456 → No digit is correct.",
        display: "Enter the 3-digit code.",
        answer: "581"
    },

    {
        question:
            "Find the 3-digit code.<br><br>" +
            "123 → One digit is correct but wrongly placed.<br>" +
            "456 → One digit is correct and correctly placed.<br>" +
            "789 → No digit is correct.<br>" +
            "560 → One digit is correct but wrongly placed.",
        display: "Enter the code.",
        answer: "645"
    },

    {
        question:
            "Find the 3-digit code.<br><br>" +
            "135 → One digit is correct and correctly placed.<br>" +
            "246 → One digit is correct but wrongly placed.<br>" +
            "789 → No digit is correct.<br>" +
            "514 → One digit is correct but wrongly placed.",
        display: "Enter the code.",
        answer: "514"
    }
];


function createCodeBreakerPuzzle() {

    const selected = getNextQuestion(
        codeBreakerQuestions,
        "codebreaker"
    );

    return {
        type: "normal",
        category: "Code Breaker",
        difficulty: "Hard",
        title: "Code Breaker",
        question: selected.question,
        display: selected.display,
        answer: selected.answer
    };
}


/* =========================================
   PUZZLE TYPE BAG
========================================= */

const puzzleGenerators = [

    createSudokuPuzzle,
    createWordSearchPuzzle,
    createAnagramPuzzle,
    createRiddlePuzzle,
    createLogicPuzzle,
    createAptitudePuzzle,
    createDetectivePuzzle,
    createZebraPuzzle,
    createCodeBreakerPuzzle

];


function refillPuzzleTypeBag() {

    puzzleTypeBag = shuffle([
        ...puzzleGenerators
    ]);
}


function generatePuzzle() {

    if (puzzleTypeBag.length === 0) {
        refillPuzzleTypeBag();
    }

    const generator = puzzleTypeBag.pop();

    return generator();
}


/* =========================================
   COMPLETE PUZZLE
========================================= */

function completePuzzle(card, button = null) {

    if (card.classList.contains("completed")) {
        return;
    }

    card.classList.add("completed");

    score += 10;
    streak += 1;
    solved += 1;

    updateStats();
    saveProgress();

    if (button) {
        button.disabled = true;
    }

    const skipButton =
        card.querySelector(".skip-btn");

    if (skipButton) {
        skipButton.disabled = true;
    }
}


/* =========================================
   CREATE PUZZLE CARD
========================================= */

function createPuzzleCard() {

    puzzleId++;

    const puzzle = generatePuzzle();

    const card = document.createElement("article");

    card.className = "puzzle-card";

    card.dataset.id = puzzleId;

    let puzzleContent = "";


    /* =====================================
       SUDOKU
    ===================================== */

    if (puzzle.type === "sudoku") {

        let gridHTML = "";

        for (let row = 0; row < 6; row++) {

            for (let col = 0; col < 6; col++) {

                const value = puzzle.puzzle[row][col];

                if (value === 0) {

                    gridHTML += `
                        <input
                            type="number"
                            min="1"
                            max="6"
                            class="sudoku-cell"
                            data-row="${row}"
                            data-col="${col}"
                        >
                    `;

                } else {

                    gridHTML += `
                        <input
                            type="text"
                            class="sudoku-cell given"
                            value="${value}"
                            disabled
                        >
                    `;
                }
            }
        }

        puzzleContent = `
            <div class="sudoku-grid">
                ${gridHTML}
            </div>
        `;
    }


    /* =====================================
       WORD SEARCH
    ===================================== */

    else if (puzzle.type === "wordsearch") {

        let gridHTML = "";

        for (let row = 0; row < 6; row++) {

            for (let col = 0; col < 6; col++) {

                gridHTML += `
                    <button
                        class="word-cell"
                        data-row="${row}"
                        data-col="${col}"
                    >
                        ${puzzle.grid[row][col]}
                    </button>
                `;
            }
        }

        const wordsHTML = puzzle.words
            .map(word => `
                <span
                    class="search-word"
                    data-word="${word}"
                >
                    ${word}
                </span>
            `)
            .join("");

        puzzleContent = `
            <div class="word-search-theme">
                ${puzzle.theme}
            </div>

            <div class="word-search-grid">
                ${gridHTML}
            </div>

            <div class="word-search-words">
                ${wordsHTML}
            </div>
        `;
    }


    /* =====================================
       NORMAL PUZZLES
    ===================================== */

    else {

        let extraHTML = "";

        if (puzzle.category === "Words") {

            if (puzzle.title === "Anagram") {

                extraHTML = `
                    <div class="anagram-box">
                        <div class="anagram-word">
                            ${puzzle.display}
                        </div>
                    </div>
                `;
            }

            else {

                extraHTML = `
                    <div class="logic-box">
                        ${puzzle.display}
                    </div>
                `;
            }
        }

        else if (puzzle.category === "Logic") {

            extraHTML = `
                <div class="logic-box">
                    ${puzzle.display}
                </div>
            `;
        }

        else if (puzzle.category === "Aptitude") {

            extraHTML = `
                <div class="aptitude-box">
                    ${puzzle.display}
                </div>
            `;
        }

        else if (puzzle.category === "Detective") {

            extraHTML = `
                <div class="detective-box">
                    ${puzzle.display}
                </div>
            `;
        }

        else if (puzzle.category === "Zebra") {

            extraHTML = `
                <div class="zebra-box">
                    ${puzzle.display}
                </div>
            `;
        }

        else if (puzzle.category === "Code Breaker") {

            extraHTML = `
                <div class="code-box">
                    ${puzzle.display}
                </div>
            `;
        }

        puzzleContent = `
            ${extraHTML}

            <input
                type="text"
                class="answer-input"
                placeholder="Type your answer..."
                autocomplete="off"
            >
        `;
    }


    card.innerHTML = `

        <h2>
            ${puzzle.title}
        </h2>

        <span class="puzzle-category">
            ${puzzle.category}
        </span>

        <p class="puzzle-question">
            ${puzzle.question}
        </p>

        <div class="puzzle-area">

            ${puzzleContent}

            <div class="feedback"></div>

            <button class="check-btn">
                Check Answer
            </button>

            <button class="skip-btn">
                Skip
            </button>

        </div>
    `;


    feed.appendChild(card);


    /* =====================================
       SUDOKU CHECK
    ===================================== */

    if (puzzle.type === "sudoku") {

        const checkButton =
            card.querySelector(".check-btn");

        const skipButton =
            card.querySelector(".skip-btn");

        const feedback =
            card.querySelector(".feedback");

        checkButton.addEventListener(
            "click",
            () => {

                if (
                    card.classList.contains("completed")
                ) {
                    return;
                }

                const cells =
                    card.querySelectorAll(
                        ".sudoku-cell:not(.given)"
                    );

                let correct = true;
                let complete = true;

                cells.forEach(cell => {

                    const row =
                        Number(cell.dataset.row);

                    const col =
                        Number(cell.dataset.col);

                    const value =
                        Number(cell.value);

                    if (!value) {
                        complete = false;
                        correct = false;
                        return;
                    }

                    if (
                        value !==
                        puzzle.solution[row][col]
                    ) {
                        correct = false;
                    }
                });


                if (complete && correct) {

                    feedback.textContent =
                        "Correct! +10 points";

                    completePuzzle(
                        card,
                        checkButton
                    );
                }

                else if (!correct) {

                    feedback.textContent =
                        "Wrong! Correct solution has been filled in.";

                    cells.forEach(cell => {

                        const row =
                            Number(cell.dataset.row);

                        const col =
                            Number(cell.dataset.col);

                        cell.value =
                            puzzle.solution[row][col];
                    });

                    streak = 0;

                    updateStats();
                    saveProgress();
                }

                else {

                    feedback.textContent =
                        "Please fill all the empty cells.";
                }
            }
        );


        skipButton.addEventListener(
            "click",
            () => {

                feedback.textContent =
                    "Skipped.";

                streak = 0;

                updateStats();
                saveProgress();

                checkButton.disabled = true;
                skipButton.disabled = true;
            }
        );
    }


    /* =====================================
       WORD SEARCH
    ===================================== */

    else if (puzzle.type === "wordsearch") {

        const checkButton =
            card.querySelector(".check-btn");

        const skipButton =
            card.querySelector(".skip-btn");

        const feedback =
            card.querySelector(".feedback");

        const cells =
            card.querySelectorAll(".word-cell");

        let firstSelected = null;
        let secondSelected = null;

        const foundWords = new Set();


        cells.forEach(cell => {

            cell.addEventListener(
                "click",
                () => {

                    if (
                        card.classList.contains("completed")
                    ) {
                        return;
                    }

                    if (!firstSelected) {

                        firstSelected = {
                            row:
                                Number(
                                    cell.dataset.row
                                ),

                            col:
                                Number(
                                    cell.dataset.col
                                )
                        };

                        cell.classList.add(
                            "selected"
                        );

                        return;
                    }


                    secondSelected = {

                        row:
                            Number(
                                cell.dataset.row
                            ),

                        col:
                            Number(
                                cell.dataset.col
                            )
                    };


                    const start =
                        firstSelected;

                    const end =
                        secondSelected;


                    let matchedWord = null;


                    for (
                        const word of puzzle.words
                    ) {

                        if (
                            foundWords.has(word)
                        ) {
                            continue;
                        }

                        const placement =
                            puzzle.placements[word];


                        if (!placement) {
                            continue;
                        }


                        const first =
                            placement[0];

                        const last =
                            placement[
                                placement.length - 1
                            ];


                        const forward =
                            start.row === first.row &&
                            start.col === first.col &&
                            end.row === last.row &&
                            end.col === last.col;


                        const backward =
                            start.row === last.row &&
                            start.col === last.col &&
                            end.row === first.row &&
                            end.col === first.col;


                        if (
                            forward ||
                            backward
                        ) {

                            matchedWord = word;

                            break;
                        }
                    }


                    cells.forEach(
                        c =>
                            c.classList.remove(
                                "selected"
                            )
                    );


                    if (matchedWord) {

                        foundWords.add(
                            matchedWord
                        );


                        const placement =
                            puzzle.placements[
                                matchedWord
                            ];


                        placement.forEach(
                            position => {

                                const cell =
                                    card.querySelector(
                                        `.word-cell[data-row="${position.row}"][data-col="${position.col}"]`
                                    );

                                if (cell) {
                                    cell.classList.add(
                                        "found"
                                    );
                                }
                            }
                        );


                        const wordElement =
                            card.querySelector(
                                `.search-word[data-word="${matchedWord}"]`
                            );

                        if (wordElement) {
                            wordElement.classList.add(
                                "found-word"
                            );
                        }


                        feedback.textContent =
                            `Found: ${matchedWord}`;


                        if (
                            foundWords.size ===
                            puzzle.words.length
                        ) {

                            feedback.textContent =
                                "Correct! All words found. +10 points";

                            completePuzzle(
                                card,
                                checkButton
                            );
                        }
                    }

                    else {

                        feedback.textContent =
                            "Wrong selection! Try again.";
                    }


                    firstSelected = null;
                    secondSelected = null;
                }
            );
        });


        checkButton.addEventListener(
            "click",
            () => {

                if (
                    card.classList.contains("completed")
                ) {
                    return;
                }

                if (
                    foundWords.size ===
                    puzzle.words.length
                ) {

                    completePuzzle(
                        card,
                        checkButton
                    );

                    feedback.textContent =
                        "Correct! +10 points";
                }

                else {

                    const remaining =
                        puzzle.words.length -
                        foundWords.size;

                    feedback.textContent =
                        `${remaining} word(s) still remaining.`;
                }
            }
        );


        skipButton.addEventListener(
            "click",
            () => {

                feedback.textContent =
                    "Skipped.";

                streak = 0;

                updateStats();
                saveProgress();

                checkButton.disabled = true;
                skipButton.disabled = true;
            }
        );
    }


    /* =====================================
       NORMAL PUZZLE CHECK
    ===================================== */

    else {

        const input =
            card.querySelector(".answer-input");

        const checkButton =
            card.querySelector(".check-btn");

        const skipButton =
            card.querySelector(".skip-btn");

        const feedback =
            card.querySelector(".feedback");


        checkButton.addEventListener(
            "click",
            () => {

                if (
                    card.classList.contains("completed")
                ) {
                    return;
                }


                const userAnswer =
                    normalize(input.value);

                const correctAnswer =
                    normalize(puzzle.answer);


                if (!userAnswer) {

                    feedback.textContent =
                        "Please enter an answer.";

                    return;
                }


                if (
                    userAnswer ===
                    correctAnswer
                ) {

                    feedback.textContent =
                        "Correct! +10 points";

                    completePuzzle(
                        card,
                        checkButton
                    );

                    input.disabled = true;
                }

                else {

                    feedback.textContent =
                        `Wrong! Correct answer: ${puzzle.answer}`;

                    streak = 0;

                    updateStats();
                    saveProgress();

                    checkButton.disabled = true;
                    input.disabled = true;
                    skipButton.disabled = true;
                }
            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    checkButton.click();
                }
            }
        );


        skipButton.addEventListener(
            "click",
            () => {

                feedback.textContent =
                    `Skipped. Correct answer: ${puzzle.answer}`;

                streak = 0;

                updateStats();
                saveProgress();

                input.disabled = true;

                checkButton.disabled = true;
                skipButton.disabled = true;
            }
        );
    }


    return card;
}


/* =========================================
   LOAD PUZZLES
========================================= */

function loadPuzzles(amount = 5) {

    for (let i = 0; i < amount; i++) {

        createPuzzleCard();
    }
}


/* =========================================
   INFINITE SCROLL
========================================= */

window.addEventListener(
    "scroll",
    () => {

        if (loadingMore) {
            return;
        }


        const scrollPosition =
            window.innerHeight +
            window.scrollY;

        const pageHeight =
            document.documentElement
                .scrollHeight;


        if (
            scrollPosition >=
            pageHeight - 500
        ) {

            loadingMore = true;

            loading.style.display = "block";


            setTimeout(
                () => {

                    loadPuzzles(5);

                    loading.style.display =
                        "none";

                    loadingMore = false;

                },
                500
            );
        }
    }
);


/* =========================================
   INITIAL LOAD
========================================= */

loadProgress();

refillPuzzleTypeBag();

/*
   Load 9 puzzles initially.
   Since there are 9 puzzle types,
   every type appears once before
   the cycle starts again.
*/

loadPuzzles(9);
