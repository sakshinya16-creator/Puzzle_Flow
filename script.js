/* =====================================================
   PUZZLEFLOW - MIXED PUZZLE FEED
   ===================================================== */

const feed = document.getElementById("puzzleFeed");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const solvedEl = document.getElementById("solved");
const loadingEl = document.getElementById("loading");


/* =====================================================
   GAME DATA
   ===================================================== */

let score = Number(localStorage.getItem("puzzleflow-score")) || 0;
let streak = Number(localStorage.getItem("puzzleflow-streak")) || 0;
let solved = Number(localStorage.getItem("puzzleflow-solved")) || 0;

let puzzleId = 0;
let loadingMore = false;


/* =====================================================
   QUESTION BAGS
   Prevents questions from repeating until all questions
   in that category have been used.
   ===================================================== */

let detectiveBag = [];
let zebraBag = [];
let codeBreakerBag = [];
let anagramBag = [];
let riddleBag = [];
let logicBag = [];
let aptitudeBag = [];


/* =====================================================
   PUZZLE TYPE BAG
   Makes sure different puzzle types are mixed.
   Each type appears once before a type is repeated.
   ===================================================== */

let puzzleTypeBag = [];


/* =====================================================
   SAVE STATS
   ===================================================== */

function saveStats() {
    localStorage.setItem("puzzleflow-score", score);
    localStorage.setItem("puzzleflow-streak", streak);
    localStorage.setItem("puzzleflow-solved", solved);

    updateStats();
}


function updateStats() {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    solvedEl.textContent = solved;
}

updateStats();


/* =====================================================
   BASIC HELPERS
   ===================================================== */

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function shuffle(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}


function normalize(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


/* =====================================================
   GET QUESTION WITHOUT REPEATING
   ===================================================== */

function getNextQuestion(questionList, bagName) {

    let bag;

    if (bagName === "detective") bag = detectiveBag;
    else if (bagName === "zebra") bag = zebraBag;
    else if (bagName === "codebreaker") bag = codeBreakerBag;
    else if (bagName === "anagram") bag = anagramBag;
    else if (bagName === "riddle") bag = riddleBag;
    else if (bagName === "logic") bag = logicBag;
    else if (bagName === "aptitude") bag = aptitudeBag;

    if (!bag) {
        return randomItem(questionList);
    }

    if (bag.length === 0) {
        bag.push(...shuffle(questionList));
    }

    return bag.pop();
}


/* =====================================================
   PUZZLE TYPE BAG
   ===================================================== */

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
    puzzleTypeBag = shuffle([...puzzleGenerators]);
}


function getNextPuzzleGenerator() {

    if (puzzleTypeBag.length === 0) {
        refillPuzzleTypeBag();
    }

    return puzzleTypeBag.pop();
}


/* =====================================================
   SUDOKU
   ===================================================== */

function createSudokuPuzzle() {

    const solution = [
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [2, 3, 4, 5, 6, 1],
        [5, 6, 1, 2, 3, 4],
        [3, 4, 5, 6, 1, 2],
        [6, 1, 2, 3, 4, 5]
    ];

    const puzzle = solution.map(row => [...row]);

    const positions = [];

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            positions.push([r, c]);
        }
    }

    shuffle(positions);

    for (let i = 0; i < 14; i++) {
        const [r, c] = positions[i];
        puzzle[r][c] = 0;
    }

    return {
        category: "Sudoku",
        type: "sudoku",
        question: "Fill in the missing numbers.",
        puzzle,
        solution
    };
}


/* =====================================================
   WORD SEARCH
   ===================================================== */

const wordThemes = {
    Animals: [
        "CAT",
        "DOG",
        "TIGER",
        "HORSE",
        "LION",
        "BEAR"
    ],

    Nature: [
        "TREE",
        "RIVER",
        "CLOUD",
        "FLOWER",
        "RAIN",
        "LEAF"
    ],

    Food: [
        "PIZZA",
        "BREAD",
        "APPLE",
        "RICE",
        "CAKE",
        "MANGO"
    ],

    Sports: [
        "CRICKET",
        "TENNIS",
        "SOCCER",
        "RACING",
        "GOLF",
        "BOXING"
    ],

    Fashion: [
        "SHIRT",
        "DRESS",
        "JEANS",
        "SHOE",
        "HAT",
        "COAT"
    ]
};


function createWordSearchPuzzle() {

    const size = 6;

    const theme = randomItem(Object.keys(wordThemes));

    let possibleWords = wordThemes[theme]
        .filter(word => word.length <= size);

    possibleWords = shuffle(possibleWords);

    const words = possibleWords.slice(0, 4);

    const grid = Array.from(
        { length: size },
        () => Array(size).fill("")
    );

    const placements = [];

    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [0, -1],
        [-1, 0],
        [-1, -1],
        [1, -1],
        [-1, 1]
    ];


    function canPlace(word, row, col, dr, dc) {

        const endRow = row + dr * (word.length - 1);
        const endCol = col + dc * (word.length - 1);

        if (
            endRow < 0 ||
            endRow >= size ||
            endCol < 0 ||
            endCol >= size
        ) {
            return false;
        }

        for (let i = 0; i < word.length; i++) {

            const r = row + dr * i;
            const c = col + dc * i;

            if (
                grid[r][c] !== "" &&
                grid[r][c] !== word[i]
            ) {
                return false;
            }
        }

        return true;
    }


    for (const word of words) {

        let placed = false;

        for (let attempt = 0; attempt < 100 && !placed; attempt++) {

            const [dr, dc] = randomItem(directions);

            const row = random(0, size - 1);
            const col = random(0, size - 1);

            if (canPlace(word, row, col, dr, dc)) {

                for (let i = 0; i < word.length; i++) {

                    const r = row + dr * i;
                    const c = col + dc * i;

                    grid[r][c] = word[i];
                }

                placements.push({
                    word,
                    start: [row, col],
                    end: [
                        row + dr * (word.length - 1),
                        col + dc * (word.length - 1)
                    ]
                });

                placed = true;
            }
        }
    }


    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let r = 0; r < size; r++) {

        for (let c = 0; c < size; c++) {

            if (grid[r][c] === "") {
                grid[r][c] = randomItem(letters.split(""));
            }
        }
    }


    return {
        category: "Word Search",
        type: "wordsearch",
        question: `Find all the hidden words.`,
        theme,
        grid,
        words,
        placements
    };
}


/* =====================================================
   ANAGRAM
   ===================================================== */

const anagramQuestions = [

    {
        letters: "RTAEH",
        answer: "EARTH"
    },

    {
        letters: "REHAT",
        answer: "HEART"
    },

    {
        letters: "TCA",
        answer: "CAT"
    },

    {
        letters: "RIVE",
        answer: "RIVE"
    },

    {
        letters: "ELPPA",
        answer: "APPLE"
    },

    {
        letters: "ONMO",
        answer: "MOON"
    },

    {
        letters: "RAEHT",
        answer: "EARTH"
    },

    {
        letters: "RAOGNE",
        answer: "ORANGE"
    },

    {
        letters: "RTAWS",
        answer: "STRAW"
    },

    {
        letters: "NIPATO",
        answer: "PIANO"
    }
];


function createAnagramPuzzle() {

    const data = getNextQuestion(
        anagramQuestions,
        "anagram"
    );

    return {
        category: "Anagram",
        type: "normal",
        question: `Unscramble these letters: <strong>${data.letters}</strong>`,
        answer: data.answer,
        extraHTML: `
            <div class="anagram-box">
                ${data.letters}
            </div>
        `
    };
}


/* =====================================================
   RIDDLES
   ===================================================== */

const riddleQuestions = [

    {
        question: "I have hands but cannot clap. What am I?",
        answer: "clock"
    },

    {
        question: "I have keys but cannot open locks. What am I?",
        answer: "keyboard"
    },

    {
        question: "I get wetter as I dry. What am I?",
        answer: "towel"
    },

    {
        question: "I have a face and two hands but no arms or legs. What am I?",
        answer: "clock"
    },

    {
        question: "What has many teeth but cannot bite?",
        answer: "comb"
    },

    {
        question: "What can travel around the world while staying in one corner?",
        answer: "stamp"
    },

    {
        question: "What has one eye but cannot see?",
        answer: "needle"
    },

    {
        question: "What has a neck but no head?",
        answer: "bottle"
    },

    {
        question: "What goes up but never comes down?",
        answer: "age"
    },

    {
        question: "What has words but never speaks?",
        answer: "book"
    }
];


function createRiddlePuzzle() {

    const data = getNextQuestion(
        riddleQuestions,
        "riddle"
    );

    return {
        category: "Riddle",
        type: "normal",
        question: data.question,
        answer: data.answer
    };
}


/* =====================================================
   LOGIC
   ===================================================== */

const logicQuestions = [

    {
        question: "If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?",
        answer: "no"
    },

    {
        question: "A clock shows 3:00. What is the angle between the hands?",
        answer: "90"
    },

    {
        question: "If today is Monday, what day will it be after 10 days?",
        answer: "thursday"
    },

    {
        question: "A farmer has 10 sheep. All but 3 run away. How many remain?",
        answer: "3"
    },

    {
        question: "If 5 machines make 5 items in 5 minutes, how long does 1 machine take to make 1 item?",
        answer: "5 minutes"
    },

    {
        question: "You have 3 apples and take away 2. How many apples do you have?",
        answer: "2"
    },

    {
        question: "A room has 4 corners. A cat sits in each corner. How many cats are there?",
        answer: "4"
    },

    {
        question: "If all dogs are animals and Bruno is a dog, is Bruno an animal?",
        answer: "yes"
    }
];


function createLogicPuzzle() {

    const data = getNextQuestion(
        logicQuestions,
        "logic"
    );

    return {
        category: "Logic",
        type: "normal",
        question: data.question,
        answer: data.answer
    };
}


/* =====================================================
   APTITUDE
   ===================================================== */

const aptitudeQuestions = [

    {
        question: "A shirt costs ₹500. What is 20% of ₹500?",
        answer: "100"
    },

    {
        question: "A train travels 120 km in 2 hours. What is its speed?",
        answer: "60"
    },

    {
        question: "If 5 pens cost ₹50, what is the cost of 1 pen?",
        answer: "10"
    },

    {
        question: "What is 25% of 200?",
        answer: "50"
    },

    {
        question: "A number is increased from 100 to 120. What is the percentage increase?",
        answer: "20"
    },

    {
        question: "If a car travels at 60 km/h for 3 hours, how far does it travel?",
        answer: "180"
    },

    {
        question: "What is the average of 10, 20 and 30?",
        answer: "20"
    },

    {
        question: "If 3 workers complete a job in 6 days, this is a basic work-rate question. If all work equally, how many worker-days are required?",
        answer: "18"
    },

    {
        question: "A product costs ₹800 and has a 10% discount. What is the discount amount?",
        answer: "80"
    },

    {
        question: "What is 15 × 4?",
        answer: "60"
    }
];


function createAptitudePuzzle() {

    const data = getNextQuestion(
        aptitudeQuestions,
        "aptitude"
    );

    return {
        category: "Aptitude",
        type: "normal",
        question: data.question,
        answer: data.answer
    };
}


/* =====================================================
   DETECTIVE
   ===================================================== */

const detectiveQuestions = [

    {
        question: `
            A phone disappeared from a room.

            Alex says: "Ben took it."
            Ben says: "Chris took it."
            Chris says: "Ben is lying."

            Exactly one statement is true.

            Who took the phone?
        `,
        answer: "alex"
    },

    {
        question: `
            A necklace was stolen.

            Maya says: "Riya stole it."
            Riya says: "Sam stole it."
            Sam says: "Maya is lying."

            Exactly one statement is true.

            Who stole the necklace?
        `,
        answer: "maya"
    },

    {
        question: `
            A laptop was stolen.

            Arun says: "Bala did it."
            Bala says: "I did not do it."
            Chetan says: "Arun is telling the truth."

            Exactly two statements are true.

            Who stole the laptop?
        `,
        answer: "bala"
    },

    {
        question: `
            A key is missing.

            Ravi says: "Sita took it."
            Sita says: "Tina took it."
            Tina says: "Ravi is lying."

            Exactly one statement is true.

            Who took the key?
        `,
        answer: "ravi"
    },

    {
        question: `
            A book disappeared.

            A says: "B took it."
            B says: "C took it."
            C says: "A took it."

            Exactly one statement is true.

            Who took the book?
        `,
        answer: "a"
    },

    {
        question: `
            A watch was stolen.

            Tom says: "Jerry took it."
            Jerry says: "I didn't take it."
            Harry says: "Jerry is telling the truth."

            Exactly two statements are true.

            Who took the watch?
        `,
        answer: "tom"
    },

    {
        question: `
            A bag disappeared.

            P says: "Q took the bag."
            Q says: "R took the bag."
            R says: "Q is lying."

            Exactly one statement is true.

            Who took the bag?
        `,
        answer: "p"
    },

    {
        question: `
            A camera disappeared.

            Asha says: "Bina took it."
            Bina says: "I didn't take it."
            Chet says: "Asha is lying."

            Exactly two statements are true.

            Who took the camera?
        `,
        answer: "bina"
    }
];


function createDetectivePuzzle() {

    const data = getNextQuestion(
        detectiveQuestions,
        "detective"
    );

    return {
        category: "Detective",
        type: "normal",
        question: data.question,
        answer: data.answer,
        extraHTML: `
            <div class="detective-box">
                🕵️ Analyze the statements carefully.
            </div>
        `
    };
}


/* =====================================================
   ZEBRA / LOGIC GRID
   ===================================================== */

const zebraQuestions = [

    {
        question: `
            Three friends — Ravi, Anu and Sara — each like a
            different sport: Cricket, Tennis and Football.

            Ravi likes Cricket.
            Anu does not like Football.

            What sport does Sara like?
        `,
        answer: "football"
    },

    {
        question: `
            Three students — A, B and C — have different
            favorite colors: Red, Blue and Green.

            A likes Red.
            B does not like Green.

            What color does C like?
        `,
        answer: "green"
    },

    {
        question: `
            Three people — Raj, Sam and Tim — own a Cat,
            Dog and Bird.

            Raj owns the Cat.
            Sam does not own the Bird.

            Who owns the Bird?
        `,
        answer: "tim"
    },

    {
        question: `
            Three students — Mia, Riya and Tara — prefer
            Tea, Coffee and Juice.

            Mia prefers Tea.
            Riya does not prefer Coffee.

            Who prefers Coffee?
        `,
        answer: "tara"
    },

    {
        question: `
            Three friends — Alex, Ben and Chris — live in
            Red, Blue and Green houses.

            Alex lives in the Red house.
            Ben does not live in the Green house.

            Which house does Chris live in?
        `,
        answer: "green"
    },

    {
        question: `
            Three people — P, Q and R — have pets Cat, Dog
            and Fish.

            P has the Cat.
            Q does not have the Dog.

            Who has the Dog?
        `,
        answer: "r"
    },

    {
        question: `
            Three children — A, B and C — like Apple, Mango
            and Banana.

            A likes Apple.
            B does not like Mango.

            What fruit does C like?
        `,
        answer: "mango"
    },

    {
        question: `
            Three people — X, Y and Z — choose Red, Blue
            and Yellow cards.

            X chooses Red.
            Y does not choose Yellow.

            Which card does Z choose?
        `,
        answer: "yellow"
    }
];


function createZebraPuzzle() {

    const data = getNextQuestion(
        zebraQuestions,
        "zebra"
    );

    return {
        category: "Zebra",
        type: "normal",
        question: data.question,
        answer: data.answer,
        extraHTML: `
            <div class="zebra-box">
                🧠 Use elimination to solve the puzzle.
            </div>
        `
    };
}


/* =====================================================
   CODE BREAKER
   ===================================================== */

const codeBreakerQuestions = [

    {
        question: `
            Find the 3-digit code.

            682 → One digit is correct and correctly placed.
            614 → One digit is correct but wrongly placed.
            206 → Two digits are correct but wrongly placed.
            738 → Nothing is correct.
            780 → One digit is correct but wrongly placed.
        `,
        answer: "042"
    },

    {
        question: `
            Find the 3-digit code.

            682 → One digit is correct and correctly placed.
            614 → One digit is correct but wrongly placed.
            206 → Two digits are correct but wrongly placed.
            738 → Nothing is correct.
            780 → One digit is correct but wrongly placed.
        `,
        answer: "042"
    },

    {
        question: `
            Find the 3-digit code.

            123 → One digit is correct and correctly placed.
            456 → One digit is correct but wrongly placed.
            789 → No digit is correct.
            305 → One digit is correct but wrongly placed.
        `,
        answer: "153"
    },

    {
        question: `
            Find the missing code:

            123 → One digit is correct and correctly placed.
            456 → No digit is correct.
            578 → One digit is correct but wrongly placed.
            701 → One digit is correct and correctly placed.
        `,
        answer: "701"
    },

    {
        question: `
            Find the 3-digit code:

            321 → One digit is correct and correctly placed.
            456 → No digit is correct.
            781 → One digit is correct but wrongly placed.
            390 → One digit is correct but wrongly placed.
        `,
        answer: "381"
    },

    {
        question: `
            Find the 3-digit code:

            123 → No digit is correct.
            456 → One digit is correct but wrongly placed.
            789 → One digit is correct and correctly placed.
            560 → One digit is correct and correctly placed.
        `,
        answer: "580"
    }
];


function createCodeBreakerPuzzle() {

    const data = getNextQuestion(
        codeBreakerQuestions,
        "codebreaker"
    );

    return {
        category: "Code Breaker",
        type: "normal",
        question: data.question,
        answer: data.answer,
        extraHTML: `
            <div class="code-box">
                🔐 Crack the code using the clues.
            </div>
        `
    };
}


/* =====================================================
   GENERATE NEXT PUZZLE
   ===================================================== */

function generatePuzzle() {

    const generator = getNextPuzzleGenerator();

    return generator();
}


/* =====================================================
   COMPLETE PUZZLE
   ===================================================== */

function completePuzzle(card, button = null) {

    if (card.dataset.completed === "true") {
        return;
    }

    card.dataset.completed = "true";

    score += 10;
    streak += 1;
    solved += 1;

    if (button) {
        button.disabled = true;
    }

    const feedback = card.querySelector(".feedback");

    if (feedback) {
        feedback.innerHTML = "✅ Correct! +10 points 🎉";
        feedback.className = "feedback success";
    }

    const skipButton = card.querySelector(".skip-btn");

    if (skipButton) {
        skipButton.disabled = true;
    }

    card.classList.add("completed");

    saveStats();
}


/* =====================================================
   WRONG ANSWER
   ===================================================== */

function wrongAnswer(card, correctAnswer) {

    streak = 0;

    const feedback = card.querySelector(".feedback");

    if (feedback) {

        feedback.innerHTML =
            `❌ Wrong! Correct answer: <strong>${correctAnswer}</strong>`;

        feedback.className = "feedback error";
    }

    saveStats();
}


/* =====================================================
   CREATE NORMAL PUZZLE
   ===================================================== */

function createNormalCard(puzzle) {

    const card = document.createElement("article");

    card.className = "puzzle-card";

    card.dataset.id = puzzleId++;

    let extraHTML = puzzle.extraHTML || "";

    card.innerHTML = `

        <div class="puzzle-category">
            ${puzzle.category}
        </div>

        <h2 class="puzzle-question">
            ${puzzle.question}
        </h2>

        ${extraHTML}

        <input
            type="text"
            class="answer-input"
            placeholder="Type your answer..."
            autocomplete="off"
        >

        <div class="button-row">

            <button class="check-btn">
                Check Answer
            </button>

            <button class="skip-btn">
                Skip
            </button>

        </div>

        <div class="feedback"></div>

    `;


    const input = card.querySelector(".answer-input");

    const checkButton = card.querySelector(".check-btn");

    const skipButton = card.querySelector(".skip-btn");


    checkButton.addEventListener("click", () => {

        if (card.dataset.completed === "true") {
            return;
        }

        const userAnswer = normalize(input.value);

        if (!userAnswer) {

            card.querySelector(".feedback").innerHTML =
                "⚠️ Enter an answer first.";

            return;
        }


        if (userAnswer === normalize(puzzle.answer)) {

            completePuzzle(card, checkButton);

        } else {

            wrongAnswer(card, puzzle.answer);

            input.disabled = true;
            checkButton.disabled = true;
        }

    });


    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            checkButton.click();
        }

    });


    skipButton.addEventListener("click", () => {

        if (card.dataset.completed === "true") {
            return;
        }

        streak = 0;
        saveStats();

        const feedback = card.querySelector(".feedback");

        feedback.innerHTML =
            `⏭️ Skipped. Answer: <strong>${puzzle.answer}</strong>`;

        feedback.className = "feedback error";

        input.disabled = true;
        checkButton.disabled = true;
        skipButton.disabled = true;

    });


    return card;
}


/* =====================================================
   CREATE SUDOKU CARD
   ===================================================== */

function createSudokuCard(puzzle) {

    const card = document.createElement("article");

    card.className = "puzzle-card sudoku-card";

    card.dataset.id = puzzleId++;

    let selectedCell = null;

    let html = `
        <div class="puzzle-category">
            Sudoku
        </div>

        <h2 class="puzzle-question">
            ${puzzle.question}
        </h2>

        <div class="sudoku-grid">
    `;


    for (let r = 0; r < 6; r++) {

        for (let c = 0; c < 6; c++) {

            const value = puzzle.puzzle[r][c];

            html += `
                <button
                    class="sudoku-cell ${value !== 0 ? "given" : ""}"
                    data-row="${r}"
                    data-col="${c}"
                    ${value !== 0 ? "disabled" : ""}
                >
                    ${value !== 0 ? value : ""}
                </button>
            `;
        }
    }


    html += `
        </div>

        <div class="button-row">

            <button class="check-btn">
                Check Answer
            </button>

            <button class="skip-btn">
                Skip
            </button>

        </div>

        <div class="feedback"></div>
    `;


    card.innerHTML = html;


    const cells = card.querySelectorAll(".sudoku-cell");

    cells.forEach(cell => {

        if (!cell.disabled) {

            cell.addEventListener("click", () => {

                cells.forEach(c =>
                    c.classList.remove("selected")
                );

                cell.classList.add("selected");

                selectedCell = cell;
            });

        }

    });


    const checkButton = card.querySelector(".check-btn");

    const skipButton = card.querySelector(".skip-btn");


    checkButton.addEventListener("click", () => {

        if (card.dataset.completed === "true") {
            return;
        }


        let correct = true;
        let filled = true;


        cells.forEach(cell => {

            if (cell.disabled) {
                return;
            }

            const r = Number(cell.dataset.row);
            const c = Number(cell.dataset.col);

            const value = Number(cell.textContent.trim());

            if (!value) {
                filled = false;
                return;
            }

            if (value !== puzzle.solution[r][c]) {
                correct = false;
            }

        });


        if (!filled) {

            card.querySelector(".feedback").innerHTML =
                "⚠️ Fill all the empty cells first.";

            return;
        }


        if (correct) {

            completePuzzle(card, checkButton);

        } else {

            wrongAnswer(
                card,
                "The correct Sudoku solution has been filled below."
            );


            cells.forEach(cell => {

                if (!cell.disabled) {

                    const r = Number(cell.dataset.row);
                    const c = Number(cell.dataset.col);

                    cell.textContent =
                        puzzle.solution[r][c];

                    cell.disabled = true;
                }

            });

            checkButton.disabled = true;
            skipButton.disabled = true;
        }

    });


    cells.forEach(cell => {

        if (!cell.disabled) {

            cell.addEventListener("dblclick", () => {

                cell.textContent = "";

            });

        }

    });


    skipButton.addEventListener("click", () => {

        streak = 0;
        saveStats();

        card.querySelector(".feedback").innerHTML =
            "⏭️ Skipped.";

        card.querySelector(".feedback").className =
            "feedback error";

        cells.forEach(cell => {
            cell.disabled = true;
        });

        checkButton.disabled = true;
        skipButton.disabled = true;

    });


    return card;
}


/* =====================================================
   WORD SEARCH CARD
   ===================================================== */

function createWordSearchCard(puzzle) {

    const card = document.createElement("article");

    card.className = "puzzle-card word-search-card";

    card.dataset.id = puzzleId++;

    let html = `

        <div class="puzzle-category">
            Word Search
        </div>

        <div class="theme-pill">
            ${puzzle.theme}
        </div>

        <h2 class="puzzle-question">
            ${puzzle.question}
        </h2>

        <div class="word-search-grid">
    `;


    for (let r = 0; r < 6; r++) {

        for (let c = 0; c < 6; c++) {

            html += `
                <button
                    class="word-cell"
                    data-row="${r}"
                    data-col="${c}"
                >
                    ${puzzle.grid[r][c]}
                </button>
            `;
        }
    }


    html += `
        </div>

        <div class="word-list">
            ${puzzle.words.map(word => `
                <span data-word="${word}">
                    ${word}
                </span>
            `).join("")}
        </div>

        <div class="button-row">

            <button class="check-btn">
                Check Answer
            </button>

            <button class="skip-btn">
                Skip
            </button>

        </div>

        <div class="feedback"></div>
    `;


    card.innerHTML = html;


    const cells = card.querySelectorAll(".word-cell");

    const checkButton = card.querySelector(".check-btn");

    const skipButton = card.querySelector(".skip-btn");

    let firstCell = null;

    let foundWords = new Set();


    cells.forEach(cell => {

        cell.addEventListener("click", () => {

            if (card.dataset.completed === "true") {
                return;
            }


            if (!firstCell) {

                cells.forEach(c =>
                    c.classList.remove("selected")
                );

                firstCell = cell;

                cell.classList.add("selected");

                return;
            }


            const r1 = Number(firstCell.dataset.row);
            const c1 = Number(firstCell.dataset.col);

            const r2 = Number(cell.dataset.row);
            const c2 = Number(cell.dataset.col);


            const placement = puzzle.placements.find(p => {

                const [sr, sc] = p.start;
                const [er, ec] = p.end;

                return (
                    (r1 === sr &&
                        c1 === sc &&
                        r2 === er &&
                        c2 === ec) ||

                    (r1 === er &&
                        c1 === ec &&
                        r2 === sr &&
                        c2 === sc)
                );
            });


            if (placement) {

                foundWords.add(placement.word);

                const [sr, sc] = placement.start;
                const [er, ec] = placement.end;

                const dr = Math.sign(er - sr);
                const dc = Math.sign(ec - sc);

                let r = sr;
                let c = sc;


                for (
                    let i = 0;
                    i < placement.word.length;
                    i++
                ) {

                    const target = card.querySelector(
                        `.word-cell[data-row="${r}"][data-col="${c}"]`
                    );

                    if (target) {
                        target.classList.add("found");
                    }

                    r += dr;
                    c += dc;
                }


                const wordElement =
                    card.querySelector(
                        `[data-word="${placement.word}"]`
                    );

                if (wordElement) {
                    wordElement.classList.add("found-word");
                }


                if (
                    foundWords.size ===
                    puzzle.placements.length
                ) {

                    completePuzzle(
                        card,
                        checkButton
                    );
                }

            } else {

                const feedback =
                    card.querySelector(".feedback");

                feedback.innerHTML =
                    "❌ Wrong selection! Try again.";

                feedback.className =
                    "feedback error";
            }


            cells.forEach(c =>
                c.classList.remove("selected")
            );

            firstCell = null;

        });

    });


    checkButton.addEventListener("click", () => {

        if (card.dataset.completed === "true") {
            return;
        }

        const remaining =
            puzzle.placements.length -
            foundWords.size;


        if (remaining === 0) {

            completePuzzle(
                card,
                checkButton
            );

        } else {

            card.querySelector(".feedback").innerHTML =
                `🔎 You found ${foundWords.size} of ${puzzle.placements.length} words.`;

        }

    });


    skipButton.addEventListener("click", () => {

        streak = 0;
        saveStats();

        card.querySelector(".feedback").innerHTML =
            `⏭️ Skipped. Words: ${puzzle.words.join(", ")}`;

        card.querySelector(".feedback").className =
            "feedback error";

        cells.forEach(cell => {
            cell.disabled = true;
        });

        checkButton.disabled = true;
        skipButton.disabled = true;

    });


    return card;
}


/* =====================================================
   CREATE PUZZLE CARD
   ===================================================== */

function createPuzzleCard(puzzle) {

    if (puzzle.type === "sudoku") {
        return createSudokuCard(puzzle);
    }

    if (puzzle.type === "wordsearch") {
        return createWordSearchCard(puzzle);
    }

    return createNormalCard(puzzle);
}


/* =====================================================
   LOAD PUZZLES
   ===================================================== */

function loadPuzzles(amount = 9) {

    if (loadingMore) {
        return;
    }

    loadingMore = true;

    if (loadingEl) {
        loadingEl.style.display = "block";
    }


    setTimeout(() => {

        for (let i = 0; i < amount; i++) {

            const puzzle = generatePuzzle();

            const card = createPuzzleCard(puzzle);

            feed.appendChild(card);
        }


        loadingMore = false;

        if (loadingEl) {
            loadingEl.style.display = "none";
        }

    }, 300);
}


/* =====================================================
   INFINITE SCROLL
   ===================================================== */

window.addEventListener("scroll", () => {

    const scrollPosition =
        window.innerHeight +
        window.scrollY;

    const pageHeight =
        document.documentElement.scrollHeight;


    if (
        scrollPosition >= pageHeight - 700 &&
        !loadingMore
    ) {

        loadPuzzles(5);
    }

});


/* =====================================================
   START PUZZLE FEED
   ===================================================== */

/*
   Start with 9 puzzles so that every puzzle type
   appears once before any type is repeated.
*/

loadPuzzles(9);