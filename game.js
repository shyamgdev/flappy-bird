kaboom({
  width: 500,
  height: 700,
  stretch: true,
  letterbox: true,
})

// =======load sprites & sounds=======

loadSprite("bg", "sprites/background.png")
loadSprite("player", "sprites/player.png")
loadSprite("play", "sprites/play.png")
loadSprite("pause", "sprites/pause.png")
loadSound("score", "/sounds/score.mp3")
loadSound("wooosh", "/sounds/wooosh.mp3")
loadSound("hit", "/sounds/hit.mp3")

let highScore = 0


scene("game", () => {
  // ======add bakground======

  add([
    sprite("bg", {
      width: width(),
      height: height()
    })
  ])

  // ======add player======

  add([
    sprite("player", {
      width: 50,
    }),
    pos(width() / 2 - 50, height() / 2),
    area(),
    z(2),
    "player",
    {
      speed: 50,
      dir: choose([-1, 1]),
    },
  ])

  onUpdate("player", (p) => {
    if (p.pos.y < 330 || p.pos.y > height() / 2) {
      p.dir = -p.dir
    }
    p.move(0, p.dir * p.speed)
  })

  // ======add text======

  add([
    text("Click to Play", {
      size: 30,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 + 108),
    area(),
    scale(1),
    origin("center"),
    z(2)
  ])

  // ======add rect======

  add([
    rect(width() / 2 + 100, 50),
    color(0, 127, 255),
    pos(width() / 2, height() / 2 + 108),
    scale(1),
    origin("center"),
    z(1)
  ])

  // ======click event======

  onKeyPress("space", () => {
    go("start")
  })

  onClick(() => {
    go("start")
  })

  onTouchStart(() => {
    go("start")
  })

})


scene("start", () => {

  const jump = 500
  const PIPE_OPEN = 260
  const PIPE_MIN = 40
  const CEILING = -60
  let SPEED = 300
  let score = 0
  let playerDie = false
  let gamePause = false

  // ======add bakground======

  add([
    sprite("bg", {
      width: width(),
      height: height()
    })
  ])

  // ======add player======

  const player = add([
    sprite("player", {
      width: 50,
    }),
    pos(width() / 2 - 100, height() / 2 - 100),
    area(),
    body(),
    z(2),
    "player"
  ])

  // ======add pause button======

  const pauseButton = add([
    sprite("pause"),
    pos(60, 20),
    fixed(),
    area(),
    origin("center"),
    z(2),
    "pause"
  ])

  // ======add score======

  const scoreLabel = add([
    text(score),
    pos(width() / 2, 50),
    origin("center"),
    z(2)
  ])

  // ======click event (jump)======

  onKeyPress("space", () => {
    if(!gamePause) {
    player.jump(jump)
    play("wooosh")
    }
  })

  onKeyDown("space", () => {
    if(!gamePause) {
    player.jump(jump)
    }
  })

  onClick(() => {
    if(!gamePause) {
    player.jump(jump)
    play("wooosh")
    }
  })

  // ======pause game======

  onKeyPress("p", () => {
    pause()
  })

  pauseButton.onClick(() => {
    pause()
  })

  onTouchStart((id, pos) => {
    if (pauseButton.pos.x >= pos.x || pauseButton.pos.y >= pos.y) {
      pause()
    }
    else if(!gamePause) {
      player.jump(jump)
      play("wooosh")
    }
  })

  // ======add pipe======  

  function addPipe() {

    const h1 = rand(PIPE_MIN, height() - PIPE_MIN - PIPE_OPEN)
    const h2 = height() - h1 - PIPE_OPEN

    add([
      pos(width(), 0),
      rect(64, h1),
      color(0, 127, 255),
      outline(4),
      area(),
      move(LEFT, SPEED),
      cleanup(),
      "pipe"
    ])

    add([
      pos(width(), h1 + PIPE_OPEN),
      rect(64, h2),
      color(0, 127, 255),
      outline(4),
      area(),
      move(LEFT, SPEED),
      cleanup(),
      "pipe",
      { passed: false, },
    ])

  }

  // ======loop for infinite pipe======
  wait(2, () => {
    loop(1, () => {
      if(gamePause || playerDie) {
        return;
      }
      if (!playerDie && !gamePause) {
        addPipe()
      }
    })
  })


  // ======game pause function======  

  function pause() {
    console.log(pauseButton)
    if (!gamePause) {
      gamePause = true
      player.paused = true
      pauseButton.text = "Resume"
      every("pipe", (pipe) => {
        pipe.paused = true
      })
    }
    else {
      gamePause = false
      player.paused = false
      pauseButton.text = "Pause"
      every("pipe", (pipe) => {
        pipe.paused = false
      })
    }
  }

  // ======player colide with pipe======

  player.onCollide("pipe", () => {
    go("playerDie", score)
    play("hit")
  })

  // check for fall death
  player.onUpdate(() => {
    if (player.pos.y >= height() || player.pos.y <= CEILING) {
      go("playerDie", score)
    }
  })

  // check if player passed the pipe
  onUpdate("pipe", (p) => {
    if (p.pos.x + p.width <= player.pos.x && p.passed === false) {
      addScore()
      p.passed = true
    }
    if(p.pos.x + p.width <= 0){
      destroy(p)
    }
  })

  function addScore() {
    score++
    scoreLabel.text = score
    play("score")
    if (SPEED < 501 && score > 15) {
      SPEED += 10
    }
  }

})



// ======player die scene======

scene("playerDie", (score) => {
  playerDie = true;

  // ======check score is greater than highScore======
  if (score > highScore) {
    highScore = score;
  }

  // ======display bakground======
  add([
    sprite("bg", {
      width: width(),
      height: height()
    })
  ])

  add([
    text("Gameover", {
      size: 48,
      font: "sink"
    }),
    pos(width() / 2, height() / 2 - 200),
    scale(1),
    origin("center"),
  ])

  // ======display player======
  add([
    sprite("player"),
    pos(width() / 2, height() / 2 - 50),
    scale(1),
    origin("center"),
  ])

  // ======display score======
  add([
    text("Score:" + score, {
      size: 40,
      font: "sink"
    }),
    pos(width() / 2, height() / 2 + 108),
    scale(1),
    origin("center"),
  ])

  // ======display highScore======
  add([
    text("highScore:" + highScore, {
      size: 40,
      font: "sink"
    }),
    pos(width() / 2, height() / 2 + 170),
    scale(1),
    origin("center"),
  ])

  // ======restart the game======
  add([
    text("Click to Restart", {
      size: 40,
      font: "sink"
    }),
    pos(width() / 2, height() / 2 + 250),
    scale(1),
    origin("center"),
  ])

  // go back to game with space is pressed
  onKeyPress("space", () => {
    go("game")
  })

  onClick(() => {
    go("game")
  })

  onTouchStart(() => {
    go("game")
  })
})

go("game")