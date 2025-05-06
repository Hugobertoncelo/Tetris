document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const maxscoreboard = document.querySelector("#max-score");
  const scoreboard = document.querySelector("#score");
  const levelboard = document.querySelector("#level");
  const buttonPause = document.querySelector("#btn-pause");
  const buttonReset = document.querySelector("#btn-reset");
  const buttonUp = document.querySelector("#btn-up");
  const buttonDown = document.querySelector("#btn-down");
  const buttonLeft = document.querySelector("#btn-left");
  const buttonRight = document.querySelector("#btn-right");
  const buttonMute = document.querySelector("#btn-mute");
  const buttonAbout = document.querySelector("#btn-about");
  const h1Title = document.querySelector("#title");

  const path = window.location.pathname;
  var sndBackground = new Audio(path + "audio/background.mp3");
  sndBackground.volume = 0.1;
  sndBackground.loop = true;

  var sndScore = new Audio(path + "audio/score.mp3");
  sndScore.volume = 0.8;
  sndScore.loop = false;

  var sndMove = new Audio(path + "audio/move.wav");
  sndMove.volume = 0.2;
  sndMove.loop = false;

  var sndGameOver = new Audio(path + "audio/gameover.wav");
  sndGameOver.volume = 0.5;
  sndGameOver.loop = false;

  const width = 10;

  let timerId;
  let score = 0;
  let maxscore = 0;
  let level = 1;

  let position;
  let form;
  let rotation;
  let current;

  let nextForm;

  const L = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];
  const Z = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];
  const T = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];
  const O = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];
  const I = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const tetrominoes = [L, Z, T, O, I];
  const colors = [
    "radial-gradient(circle, rgba(155,89,182,1) 0%, rgba(142,68,173,1) 100%)",
    "radial-gradient(circle, rgba(52,152,219,1) 0%, rgba(41,128,185,1) 100%)",
    "radial-gradient(circle, rgba(46,204,113,1) 0%, rgba(39,174,96,1) 100%)",
    "radial-gradient(circle, rgba(241,196,15,1) 0%, rgba(243,156,18,1) 100%)",
    "radial-gradient(circle, rgba(231,76,60,1) 0%, rgba(192,57,43,1) 100%)",
  ];

  function genTetromino() {
    position = 4;
    form =
      nextForm != null
        ? nextForm
        : Math.floor(Math.random() * tetrominoes.length);
    nextForm = Math.floor(Math.random() * tetrominoes.length);
    rotation = Math.floor(Math.random() * 4);
    current = tetrominoes[form][rotation];
    draw();
  }

  function draw() {
    current.forEach((index) => {
      squares[position + index].classList.add("tetromino");
      squares[position + index].style.background = colors[form];
    });
  }

  function undraw() {
    current.forEach((index) => {
      squares[position + index].classList.remove("tetromino");
      squares[position + index].style.background = "";
    });
  }

  function control(e) {
    sndMove.play();
    const keyAction = {
      37: moveLeft,
      38: rotate,
      39: moveRight,
      40: moveDown,
    };
    if (e.keyCode in keyAction && timerId) keyAction[e.keyCode]();
  }
  document.addEventListener("keydown", control);

  function moveLeft() {
    const isLeftEdge = current.some(
      (index) => (position + index) % width === 0
    );
    const colision = current.some((index) =>
      squares[position - 1 + index].classList.contains("taken")
    );
    if (!isLeftEdge && !colision) {
      undraw();
      position -= 1;
      draw();
    }
  }

  function rotate() {
    undraw();
    rotation = rotation + 1 < current.length ? rotation + 1 : 0;
    current = tetrominoes[form][rotation];
    draw();

    const isLeftEdge = current.some(
      (index) => (position + index) % width === 0
    );
    const isRightEdge = current.some(
      (index) => (position + index) % width === width - 1
    );
    const colision = current.some((index) =>
      squares[position + 1 + index].classList.contains("taken")
    );
    if ((isLeftEdge && isRightEdge) || colision) {
      undraw();
      rotation = rotation - 1 > -1 ? rotation - 1 : current.length - 1;
      current = tetrominoes[form][rotation];
      draw();
    }
  }

  function moveRight() {
    const isRightEdge = current.some(
      (index) => (position + index) % width === width - 1
    );
    const colision = current.some((index) =>
      squares[position + 1 + index].classList.contains("taken")
    );
    if (!isRightEdge && !colision) {
      undraw();
      position += 1;
      draw();
    }
  }

  function moveDown() {
    const colision = current.some((index) =>
      squares[position + index + width].classList.contains("taken")
    );
    if (!colision) {
      undraw();
      position += width;
      draw();
    }
    freeze();
  }

  function freeze() {
    const colision = current.some((index) =>
      squares[position + index + width].classList.contains("taken")
    );
    if (colision) {
      current.forEach((index) =>
        squares[position + index].classList.add("taken")
      );

      genTetromino();
      previewShape();

      addScore();
      gameOver();
    }
  }

  function previewShape() {
    const previewSquares = document.querySelectorAll(".mini-grid div");
    const previewWidth = 4;
    const previewPosition = 0;

    const previewTetrominoes = [
      [1, previewWidth + 1, previewWidth * 2 + 1, 2],
      [0, previewWidth, previewWidth + 1, previewWidth * 2 + 1],
      [1, previewWidth, previewWidth + 1, previewWidth + 2],
      [0, 1, previewWidth, previewWidth + 1],
      [1, previewWidth + 1, previewWidth * 2 + 1, previewWidth * 3 + 1],
    ];

    previewSquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.background = "";
    });

    const previewCurrent = previewTetrominoes[nextForm];
    previewCurrent.forEach((index) => {
      previewSquares[previewPosition + index].classList.add("tetromino");
      previewSquares[previewPosition + index].style.background =
        colors[nextForm];
    });
  }

  function addScore() {
    for (let i = 0; i < squares.length - width; i += width) {
      const row = Array.from({ length: width }, (v, k) => i + k);
      if (row.every((index) => squares[index].classList.contains("taken"))) {
        sndScore.play();
        score += 10;
        scoreboard.innerHTML = score;
        if (score > maxscore) {
          maxscore = score;
          maxscoreboard.innerHTML = maxscore;
        }
        if (score % 100 == 0) {
          level += 1;
          levelboard.innerHTML = level;
          pauseGame();
          resumeGame();
        }
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.background = "";
        });
        undraw();
        const removedSquares = squares.splice(i, width);
        squares = removedSquares.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
        draw();
      }
    }
  }

  function pauseGame() {
    if (timerId) {
      h1Title.innerHTML = "Jogo pausado!";
      sndBackground.pause();
      clearInterval(timerId);
      timerId = null;
    }
  }

  function resumeGame() {
    sndBackground.play();
    timerId = setInterval(moveDown, Math.max(1, 1000 - 100 * level));
    h1Title.innerHTML = "Tetris";
  }

  function playGame() {
    pauseGame();

    squares.forEach((square, index) => {
      square.classList.remove("tetromino");
      squares[index].style.background = "";
      if (index < squares.length - width) {
        square.classList.remove("taken");
      }
    });

    score = 0;
    level = 1;
    scoreboard.innerHTML = score;
    h1Title.innerHTML = "Tetris";

    genTetromino();
    draw();
    previewShape();
    resumeGame();
  }

  function gameOver() {
    if (
      current.some((index) =>
        squares[position + index].classList.contains("taken")
      )
    ) {
      pauseGame();
      sndBackground.pause();
      sndGameOver.play();
      h1Title.innerHTML = "Game Over!";
      buttonPause.setAttribute("hidden", true);
      buttonReset.innerHTML = "Jogue novamente";
      buttonReset.style.width = "160px";
      buttonUp.setAttribute("hidden", true);
      buttonLeft.setAttribute("hidden", true);
      buttonRight.setAttribute("hidden", true);
      buttonDown.setAttribute("hidden", true);
      buttonMute.setAttribute("hidden", true);
    }
  }

  buttonPause.addEventListener("click", () => {
    if (timerId) {
      pauseGame();
      buttonPause.innerHTML = "Resume";
    } else {
      resumeGame();
      buttonPause.innerHTML = "Pause";
    }
  });

  buttonReset.addEventListener("click", () => {
    playGame();
    buttonAbout.style.width = "40px";
    buttonReset.style.width = "40px";
    buttonReset.innerHTML = "Reset";
    buttonPause.innerHTML = "Pause";
    buttonPause.removeAttribute("hidden");
    buttonUp.removeAttribute("hidden");
    buttonLeft.removeAttribute("hidden");
    buttonRight.removeAttribute("hidden");
    buttonDown.removeAttribute("hidden");
    buttonMute.removeAttribute("hidden");
  });

  buttonUp.addEventListener("click", () => {
    sndMove.play();
    if (timerId) rotate();
  });

  let downPresssed = false;

  buttonDown.addEventListener("mousedown", () => {
    if (timerId && !downPresssed) {
      downPresssed = true;
      moveDown();

      const fastDownInterval = setInterval(() => {
        if (timerId && downPresssed) {
          moveDown();
        }
      }, 100);

      buttonDown.addEventListener("mouseup", () => {
        downPresssed = false;
        clearInterval(fastDownInterval);
      }, { once: true });
      buttonDown.addEventListener("mouseleave", () => {
        downPresssed = false;
        clearInterval(fastDownInterval);
      }, { once: true });
    }
  });

  buttonLeft.addEventListener("click", () => {
    sndMove.play();
    if (timerId) moveLeft();
  });

  buttonRight.addEventListener("click", () => {
    sndMove.play();
    if (timerId) moveRight();
  });

  buttonMute.addEventListener("click", () => {
    if (sndBackground.volume !== 0) {
      sndBackground.pause();
      sndBackground.volume = 0;
      sndGameOver.volume = 0;
      sndMove.volume = 0;
      sndScore.volume = 0;
      buttonMute.innerHTML = "Unmute";
    } else {
      sndBackground.play();
      sndBackground.volume = 0.1;
      sndGameOver.volume = 0.5;
      sndMove.volume = 0.2;
      sndScore.volume = 0.8;
      buttonMute.innerHTML = "Mute";
    }
  });

  buttonAbout.addEventListener("click", () => {
    if (timerId) {
      pauseGame();
      buttonPause.innerHTML = "Resume";
    }
    window.open("https://github.com/Hugobertoncelo/Tetris", "_blank");
  });

  playGame();
});