class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
    });

    this.configure();
  }
  configure() {
    this.screen = "home";

    this.instructionGiven = false;

    this.score = localStorage.getItem("axa-bird-game-score");

    if (this.score === null) {
      this.score = 0;
    }

    this.highScore = localStorage.getItem("axa-bird-game-highScore");

    if (this.highScore === null) {
      this.highScore = 0;
    }

    this.remember = localStorage.getItem("axa-bird-game-remember");

    if (this.remember === null) {
      this.remember = false;

      this.username = null;

      this.email = null;

      this.news = null;
    } else if (this.remember) {
      this.username = localStorage.getItem("axa-bird-game-username");

      this.email = localStorage.getItem("axa-bird-game-email");

      this.news = localStorage.getItem("axa-bird-game-news");
    }

    this.codes = [];

    this.unlocked = null;

    this.soundOn = true;

    this.socket = new io();

    this.socket.on("userData", (data) => {
      if (data.codes) {
        try {
          const codes = JSON.parse(data.codes);
          if (Array.isArray(codes)) {
            this.codes = codes.sort((a, b) => a.points - b.points);
          }
        } catch (err) {
          console.log(err);
        }
      }
    });

    if (this.username) {
      this.socket.emit("userData", { username: this.username });
    }

    this.socket.on("usernameTaken", () => {
      this.notify(3);
    });

    this.socket.on("newUser", (data) => {
      if (data.remember) {
        this.username = data.username;

        this.email = data.email;

        localStorage.setItem("axa-bird-game-username", this.username);

        localStorage.setItem("axa-bird-game-email", this.email);

        localStorage.setItem("axa-bird-game-news", this.news);

        localStorage.setItem("axa-bird-game-remember", this.remember);
      }

      this.screen = "leaderboard";

      this.scene.restart();
    });

    this.socket.on("leaderboard", (data) => {
      this.loader.style.display = "none";

      this.addLeaderboardUI(data);
    });
    // this.socket.deleteData();
  }

  preload() {
    this.load.setBaseURL("assets");
    this.load.plugin(
      "rexroundrectangleplugin",
      "plugins/rexroundrectangleplugin.min.js",
      true
    );
    this.load.image("UIBackground", "backgrounds/background2.png");
    this.load.image("background", "backgrounds/background.png");
    this.load.image("bg2", "backgrounds/background2.png");
    this.load.image("logo", "UI/background-logo.png");
    this.load.image("play", "UI/play-button.png");
    this.load.image("heart", "player/heart.png");
    this.load.image("heart-filled", "player/heart-filled.png");
    this.load.image("star", "collectibles/star.png");
    this.load.image("home", "UI/home-icon.png");
    this.load.image("info", "UI/info.png");
    this.load.image("close", "UI/close.png");
    this.load.image("infoIcon", "UI/info-icon.png");
    this.load.image("userIcon", "UI/user-icon.png");
    this.load.image("pause", "UI/pause.png");
    this.load.image("resume", "UI/resume.png");
    this.load.image("soundOn", "UI/soundon-button.png");
    this.load.image("soundOff", "UI/soundoff-button.png");
    this.load.image("unlockedIcon", "UI/unlocked-icon.png");
    this.load.image("leaderboardIcon", "UI/leaderboard-icon.png");
    this.load.image("leaderboardGold", "UI/gold.png");
    this.load.image("leaderboardSilver", "UI/silver.png");
    this.load.image("leaderboardBronze", "UI/bronze.png");
    this.load.image("copyIcon", "UI/copy.png");

    this.load.image("pacman tileset", "bonkMan/tiles/tileset.png");
    this.load.tilemapTiledJSON("map", "bonkMan/pacman-map.json");
    this.load.image("dot", "bonkMan/items/dot_item.png");
    this.load.spritesheet("pacman", "bonkMan/characters/pacman/pacman0.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("pacman1", "bonkMan/characters/pacman/pacman1.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("pacman2", "bonkMan/characters/pacman/pacman2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("pacman3", "bonkMan/characters/pacman/pacman3.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("pacman4", "bonkMan/characters/pacman/pacman4.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet(
      "pinkGhost",
      "bonkMan/ghost/pink_ghost/spr_ghost_pink_0.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "orangeGhost",
      "bonkMan/ghost/orange_ghost/spr_ghost_orange_0.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "blueGhost",
      "bonkMan/ghost/blue_ghost/spr_ghost_blue_0.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "redGhost",
      "bonkMan/ghost/red_ghost/spr_ghost_red_0.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.image("bonk", "bonkMan/image.png");
    this.load.image("bonkBg", "bonkMan/bg.png");
    this.load.image("paused", "bonkMan/paused.png");
    this.load.image("gameOver", "bonkMan/gameOver.png");
    this.load.image("bonkManLogo", "bonkMan/logo.png");
    this.load.image("goToLeaderboard", "flappyBird/go-to-leaderboard.png");
    this.load.image("restart", "flappyBird/restart.png");
    this.load.image("addToLeaderboard", "flappyBird/add-to-leaderboard.png");

    for (let i = 1; i <= 3; ++i) {
      this.load.image(`product${i}`, `products/product${i + 1}.png`);
    }

    this.load.audio("jump", "sounds/jump.mp3");
    this.load.audio("product", "sounds/product.mp3");
    this.load.audio("enemy", "sounds/enemy.mp3");
    this.load.audio("lost", "sounds/lost.mp3");
    this.load.audio("lost2", "sounds/lost2.mp3");
    this.load.audio("woosh", "sounds/Woosh.mp3");
    this.load.audio("gameMusic", "sounds/game-music.mp3");
  }

  create() {
    this.scoreText2 = this.add
      .text(400, 200, this.score, {
        fontFamily: "MyLocalFont",
        stroke: "#000000",
        fontSize: "100px",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(-2)
      .setVisible(false);
    this.checkSocket();
    this.canJump = true;
  }
  checkSocket() {
    this.loader = document.querySelector("#loader");
    this.socketInterval = setInterval(() => {
      if (this.socket.connected) {
        clearInterval(this.socketInterval);

        loader.style.display = "none";

        this.addUI();
      }
    }, 50);
  }

  addUI() {
    if (this.screen === "home") {
      // this.addHomeUI();
      this.startGame();
    } else if (this.screen === "restart") {
      this.addRestartUI();
    } else if (this.screen === "info") {
      this.addInfoUI();
    } else if (this.screen === "codes") {
      this.addCodesUI();
    } else if (this.screen === "unlocked") {
      this.addUnlockedUI();
    } else if (this.screen === "leaderboard") {
      this.loader.style.display = "block";
      this.socket.emit("leaderboard");
    }
  }
  addHomeUI() {
    this.UIBackground = this.add.image(400, 600, "UIBackground").setScale(1);

    this.infoIcon = this.add
      .image(740, 55, "infoIcon")
      .setScale(0.4)
      .setInteractive();

    this.infoIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.infoIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.infoIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "info";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.logo = this.add.image(400, 200, "logo").setScale(1);

    this.titleText = this.add
      .text(
        400,
        400,
        "Jump your way upwards and collect\nAXA products. Unlock hidden offers in\nthe Rabble cashback app the higher\nscore you get.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "40px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.optionsContainer = this.add
      .rexRoundRectangle(400, 900, 620, 480, 50, 0xffffff)
      .setDepth(5)
      .setScrollFactor(0);

    this.birdImage = this.add
      .image(670, 690, "b1")
      .setScale(1.5)
      .setDepth(Infinity);
    this.birdImage.scaleX = -1.5;

    this.termsText = this.add
      .text(
        400,
        1170,
        "Powered by Md Mahabub. By playing this game you accept these Terms & policies.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "20px",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });

    this.option1 = this.add
      .rexRoundRectangle(400, 830, 520, 100, 50, 0xf3e3a3)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option1Text = this.add
      .text(400, 830, "Unlocked Offers", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);
    // color: "#2e218e",

    this.option2 = this.add
      .rexRoundRectangle(400, 945, 520, 100, 50, 0xfaa7ab)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option2Text = this.add
      .text(400, 945, "Leaderboard", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option3 = this.add
      .rexRoundRectangle(400, 1060, 520, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option3Text = this.add
      .text(400, 1060, "Play Game", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.bestScoreText = this.add
      .text(320, 730, `BEST: ${this.highScore}`, {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        stroke: "#000",
        strokeThickness: 1,
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.lastScoreText = this.add
      .text(480, 730, `LAST: ${this.score}`, {
        fontFamily: "RakeslyRG",
        fontSize: "36px",
        stroke: "#000",
        strokeThickness: 1,
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.divider = this.add
      .rectangle(400, 730, 5, 70, 0xeeeeee)
      .setDepth(6)
      .setScrollFactor(0);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.screen = "codes";
              this.scene.restart();
            },
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.screen = "leaderboard";
              this.scene.restart();
            },
          });
        },
      });
    });

    this.option3.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option3, this.option3Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option3, this.option3Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.UIBackground,
                this.logo,
                this.titleText,
                this.optionsContainer,
                this.birdImage,
                this.termsText,
                this.option1,
                this.option1Text,
                this.option2,
                this.option2Text,
                this.option3,
                this.option3Text,
                this.bestScoreText,
                this.lastScoreText,
                this.divider,
                this.infoIcon,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });
  }
  addRestartUI() {
    this.UIBackground = this.add.image(500, 600, "bonkBg").setScale(1.25, 1);
    this.yourScore = this.add
      .text(500, 220, "YOUR SCORE", {
        fontFamily: "MyLocalFont",
        fontSize: "50px",
        color: "#fff",
        align: "center",
        stroke: "#000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);
    this.scoreText = this.add
      .text(500, 350, this.score, {
        fontFamily: "MyLocalFont",
        fontSize: "80px",
        color: "#fff",
        align: "center",
        stroke: "#702300",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.usernameInput = this.add.dom(500, 800).createElement(
      "input",
      `
      	outline: none;
      	border: none;
      	padding: 0px 30px;
      	width: 440px;
      	height: 70px;
      	font-size: 30px;
      	font-weight: bold;
      	background: #ebf4f5;
      	border-radius: 0px;
        stroke: 6px solid #d95300
      `
    );

    this.usernameInput.node.setAttribute("placeholder", "Name");

    this.usernameInput.node.setAttribute("maxLength", "15");

    this.emailInput = this.add.dom(1400, 1080).createElement(
      "input",
      `
      	outline: none;
      	border: none;
      	padding: 0px 30px;
      	width: 450px;
      	height: 90px;
      	font-size: 30px;
      	font-weight: bold;
      	background: #ebf4f5;
      	border-radius: 20px;
      `
    );

    this.emailInput.node.setAttribute("placeholder", "Email");

    this.emailInput.node.setAttribute("type", "email");

    this.emailInput.node.value = "asdf@gamil.com";

    this.option1 = this.add
      .image(500, 900, "addToLeaderboard")
      .setDepth(5)
      .setScrollFactor(0)
      .setAlpha(1)
      .setScale(1.1);
    this.option1.setInteractive();

    this.option1Text = this.add
      .text(500, 700, "OR", {
        fontFamily: "MyLocalFont",
        fontSize: "50px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option2 = this.add
      .image(500, 600, "restart")
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1],
        scale: 1,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1],
            scale: 1.1,
            duration: 100,

            onComplete: () => {
              if (this.validateUsername(this.usernameInput.node.value)) {
                this.socket.emit(
                  "scoreUpdate",
                  {
                    username: this.usernameInput.node.value,
                    email: this.emailInput.node.value,
                    score: this.score,
                    remember: this.remember,
                    news: this.news,
                    newUser: true,
                  },
                  (data) => {
                    if (this.remember) {
                      this.username = data.username;
                      this.email = data.email;
                      localStorage.setItem(
                        "axa-bird-game-username",
                        this.username
                      );
                      localStorage.setItem("axa-bird-game-email", this.email);
                      localStorage.setItem("axa-bird-game-news", this.news);
                      localStorage.setItem(
                        "axa-bird-game-remember",
                        this.remember
                      );
                    }

                    if (data.unlocked) {
                      this.unlocked = data.unlocked;
                      this.screen = "unlocked";
                      this.scene.restart();
                    } else {
                      this.screen = "leaderboard";
                      this.scene.restart();
                    }
                  }
                );
              } else {
                this.notify(1);
              }
            },
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2],
            scale: 1,
            duration: 100,

            onComplete: () => {
              this.elements = [
                this.UIBackground,
                this.yourScore,
                this.scoreText,
                this.option1,
                this.option1Text,
                this.option2,
                this.usernameInput,
                this.emailInput,
                this.termsText,
              ];

              this.elements.forEach((element) => {
                element.destroy();
              });

              this.startGame();
            },
          });
        },
      });
    });

    this.termsText = this.add
      .text(
        400,
        1170,
        "Developed by Md Mahabub. By playing this game you accept these Terms & policies.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "20px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
  }
  addLeaderboardUI(data) {
    this.background = this.add
      .image(500, 600, "bonkBg")
      .setScrollFactor(0)
      .setDepth(0)
      .setAlpha(0.8);

    if (this.remember) {
      this.userIcon = this.add
        .image(650, 55, "userIcon")
        .setScale(0.5)
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(Infinity);

      this.userIcon.on("pointerdown", () => {
        this.tweens.add({
          targets: this.userIcon,
          scale: 0.4,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: this.userIcon,
              scale: 0.5,
              duration: 100,

              onComplete: () => {
                this.userIcon.destroy();

                this.notify(4);

                this.username = null;

                this.email = null;

                this.remember = false;

                localStorage.removeItem("axa-bird-game-remember");

                localStorage.removeItem("axa-bird-game-username");

                localStorage.removeItem("axa-bird-game-email");
              },
            });
          },
        });
      });
    }

    this.homeIcon = this.add
      .image(940, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.cameras.main.fadeOut(100);
              setTimeout(() => {
                this.cameras.main.fadeIn(1000);
                this.screen = "home";
                this.scene.restart();
              }, 100);
            },
          });
        },
      });
    });

    this.leaderboardImage = this.add.image(500, 170, "leaderboardIcon");

    this.leaderboardTitle = this.add
      .text(500, 310, "Leaderboard", {
        fontFamily: "RakeslyRG",
        fontSize: "50px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.scores = Object.entries(data)
      .map((score) => {
        return score[1];
      })
      .sort((a, b) => b.score - a.score);

    this.players = this.add.dom(500, 375, "div");

    this.players.node.style = `
      	margin: 0px 0px 0px -300px;
      	padding: 0px 20px 0px 0px;
      	width: 600px;
      	height: 770px;
      	display: flex;
      	flex-direction: column;
      	align-items: center;
      	justify-content: center;
      	overflow-y: auto;
      `;

    this.players.node.innerHTML = ``;

    this.scores.forEach((user, index) => {
      this.players.node.innerHTML += `
      		<div class="scoreBox">
      			<div class="scoreImageBox">
      				${
                index < 3
                  ? `<img class="scoreImage" src="assets/positions/${
                      index + 1
                    }.png"/>`
                  : `<div class="scoreText"> ${index + 1}. </div>`
              }
      			</div>

      			<div class="${
              user.username === this.username ? "scoreTitlePlus" : "scoreTitle"
            }">
      				${user.username}
      			</div>

      			<div class="${
              user.username === this.username ? "scoreValuePlus" : "scoreValue"
            }">
      				${user.score}
      			</div>
      		</div>
      	`;
    });
  }
  addCodesUI() {
    this.background = this.add
      .image(400, 600, "UIBackground")
      .setScale(1)
      .setScrollFactor(0)
      .setDepth(0);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.5,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.4,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.unlockedImage = this.add.image(400, 170, "unlockedIcon");

    this.unlockedTitle = this.add
      .text(400, 310, "Unlocked codes", {
        fontFamily: "RakeslyRG",
        fontSize: "45px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.codes.forEach((code, index) => {
      const y = 450 + index * 110;

      const codeBox = this.add
        .rexRoundRectangle(400, y, 520, 100, 20, 0xffffff)
        .setDepth(5)
        .setScrollFactor(0);

      const scoreImage = this.add
        .image(192, y, "star")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.7);

      const scoreText = this.add
        .text(300, y, `${code.points} points`, {
          fontFamily: "RakeslyRG",
          fontSize: "32px",
          color: "#000",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(6);

      const codeText = this.add
        .text(515, y, code.code, {
          fontFamily: "RakeslyRG",
          fontSize: "32px",
          color: "#000",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(6);

      const codeCopy = this.add
        .image(610, y - 3, "copyIcon")
        .setDepth(Infinity)
        .setScrollFactor(0)
        .setScale(0.1)
        .setInteractive();

      codeCopy.on("pointerdown", () => {
        this.tweens.add({
          targets: codeCopy,
          scale: 0.08,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: codeCopy,
              scale: 0.1,
              duration: 100,

              onComplete: () => {
                navigator.clipboard.writeText(code.code);

                this.notify(5);
              },
            });
          },
        });
      });
    });

    this.rabbleButton = this.add
      .rexRoundRectangle(400, 1060, 420, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.rabbleButtonText = this.add
      .text(400, 1060, "Go to Rabble", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.rabbleButton.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.rabbleButton, this.rabbleButtonText],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.rabbleButton, this.rabbleButtonText],
            scale: 1,
            duration: 100,

            onComplete: () => {},
          });
        },
      });
    });
  }
  addUnlockedUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.5)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.scoreBox = this.add
      .rexRoundRectangle(400, 200, 300, 70, 20, 0x4e316e)
      .setDepth(10)
      .setScrollFactor(0);

    this.scoreImage = this.add
      .image(265, 200, "star")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.9);

    this.scoreText = this.add
      .text(400, 200, this.score, {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#fff",
        align: "center",
        stroke: "#fff",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.ballImage = this.add
      .image(400, 100, "logo")
      .setScale(0.7)
      .setDepth(Infinity);

    if (!this.unlocked) {
      this.scene.restart();
      return;
    }

    this.titleText = this.add
      .text(
        400,
        340,
        `Congrats! You score over ${this.unlocked.points}\npoints and unlocked a special\ndeal in Rabble.`,
        {
          fontFamily: "RakeslyRG",
          fontSize: "40px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.productImage = this.add.image(400, 595, "product1").setScale(1.1);

    this.productBox = this.add
      .rexRoundRectangle(400, 850, 520, 100, 20, 0xebf4f5)
      .setDepth(Infinity)
      .setScrollFactor(0);

    this.codeText = this.add
      .text(235, 850, this.unlocked.code, {
        fontFamily: "RakeslyRG",
        fontSize: "35px",
        color: "#000",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(Infinity);

    this.codeCopy = this.add
      .image(485, 850, "copyIcon")
      .setDepth(Infinity)
      .setScrollFactor(0)
      .setScale(0.1)
      .setInteractive();

    this.copyCodeText = this.add
      .text(575, 850, "Copy Code", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#bababa",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(Infinity)
      .setInteractive();

    this.codeCopy.on("pointerdown", () => {
      this.tweens.add({
        targets: this.codeCopy,
        scale: 0.08,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.codeCopy,
            scale: 0.1,
            duration: 100,

            onComplete: () => {
              navigator.clipboard.writeText(this.unlocked.code);

              this.notify(6);
            },
          });
        },
      });
    });

    this.copyCodeText.on("pointerdown", () => {
      this.tweens.add({
        targets: this.codeCopy,
        scale: 0.08,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.codeCopy,
            scale: 0.1,
            duration: 100,

            onComplete: () => {
              navigator.clipboard.writeText(this.unlocked.code);

              this.notify(6);
            },
          });
        },
      });
    });

    this.option1 = this.add
      .rexRoundRectangle(400, 975, 520, 100, 50, 0x335519)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option1Text = this.add
      .text(400, 975, "Redeem code on Rabble", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option2 = this.add
      .rexRoundRectangle(400, 1090, 520, 100, 50, 0x4e316e)
      .setDepth(5)
      .setScrollFactor(0)
      .setInteractive();

    this.option2Text = this.add
      .text(400, 1090, "Play again", {
        fontFamily: "RakeslyRG",
        fontSize: "32px",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.option1.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option1, this.option1Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option1, this.option1Text],
            scale: 1,
            duration: 100,

            onComplete: () => {},
          });
        },
      });
    });

    this.option2.on("pointerdown", () => {
      this.tweens.add({
        targets: [this.option2, this.option2Text],
        scale: 0.85,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: [this.option2, this.option2Text],
            scale: 1,
            duration: 100,

            onComplete: () => {
              let elements = [
                this.UIackground,
                this.scoreText,
                this.yourScore,
                this.option1,
                this.option1Text,
                this.option2,
                this.termsText,
              ];

              elements.forEach((element) => {
                if (element) {
                  element.destroy();
                }
              });

              this.startGame();
            },
          });
        },
      });
    });

    this.termsText = this.add
      .text(
        400,
        1170,
        "Developed by Md. Mahabub. By playing this game you accept these Terms & policies.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "20px",
          color: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setInteractive({ cursor: "pointer" });
    this.termsText.on("pointerup", () => {
      const url = "https://www.proviva.se";
      window.open(url, "_blank");
    });
  }
  addInfoUI() {
    this.UIBackground = this.add.rectangle(400, 600, 800, 1200, 0xffffff);

    this.homeIcon = this.add
      .image(740, 55, "home")
      .setScale(0.4)
      .setInteractive();

    this.homeIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.homeIcon,
        scale: 0.4,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.homeIcon,
            scale: 0.5,
            duration: 100,

            onComplete: () => {
              this.screen = "home";

              this.scene.restart();
            },
          });
        },
      });
    });

    this.infoImage = this.add.image(400, 170, "info").setScale();

    this.infoTitle = this.add
      .text(400, 310, "Information", {
        fontFamily: "RakeslyRG",
        fontSize: "40px",
        color: "#000",
        align: "center",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.infoText = this.add
      .text(
        400,
        710,
        "Desktop Controls: Use left and right arrow keys\nto control the ball.\n\nMobile Controls: Touch left and right sides of the\nscreen to control the ball.\n\nSpring: Allows you to jump higher.\n\nJetpack: Gives you flying ability for a few seconds.\n\nProducts: Collect them to win extra points\nand rewards.\n\nMonsters: AVOID! You will lost the game if you\ncollide with them.",
        {
          fontFamily: "RakeslyRG",
          fontSize: "35px",
          color: "#000",
          align: "center",
          stroke: "#000",
          strokeThickness: 0,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);
  }
  validateEmail(value) {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (value.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  }
  validateUsername(value) {
    // Define the regex pattern to disallow certain characters
    const pattern = /[ .$#[\]\/\x00-\x1F\x7F]/;
    // Test the input string against the pattern
    if (pattern.test(value)) {
      return false; // Invalid string (contains disallowed characters)
    }
    return true; // Valid string
  }

  notify(code) {
    let message, x, y;

    if (code === 1) {
      message = "Enter your username!";

      x = 400;
      y = 100;
    } else if (code === 2) {
      message = "Invalid email!";

      x = 400;
      y = 100;
    } else if (code === 3) {
      message = "Username already taken!";

      x = 400;
      y = 100;
    } else if (code === 4) {
      message = "User removed sucessfully";

      x = 400;
      y = 40;
    } else if (code === 5) {
      message = "Code copied to clipboard";

      x = 400;
      y = 365;
    } else if (code === 6) {
      message = "Code copied to clipboard";

      x = 400;
      y = 890;
    }

    const notificationText = this.add
      .text(x, y, message, {
        fontFamily: "RakeslyRG",
        fontSize: "35px",
        color: "#f20071",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(1)
      .setDepth(Infinity);

    this.tweens.add({
      targets: notificationText,
      alpha: 1,
      duration: 200,

      onComplete: () => {
        this.time.addEvent({
          delay: 1000,

          callback: () => {
            this.tweens.add({
              targets: notificationText,
              alpha: 0,
              duration: 200,

              onComplete: () => {
                notificationText.destroy();
              },
            });
          },
        });
      },
    });
  }

  //Main Game

  startGame() {
    this.variables();
    this.addSounds();
    this.addScores();
    this.instruction();
  }
  variables() {
    this.pacman = null;
    this.direction = "null";
    this.previousDirection = "left";
    this.blockSize = 16;
    this.board = [];
    this.speed = 170;
    this.ghostSpeed = this.speed * 0.7;
    this.intersections = [];
    this.nextIntersection = null;
    this.oldNextIntersection = null;

    this.PINKY_SCATTER_TARGET = { x: 432, y: 80 };
    this.BLINKY_SCATTER_TARGET = { x: 32, y: 80 };
    this.INKY_SCATTER_TARGET = { x: 432, y: 528 };
    this.CLYDE_SCATTER_TARGET = { x: 23, y: 528 };

    this.scatterModeDuration = 7000;
    this.chaseModeDuration = 20000;
    this.entryDelay = 7000;
    this.respawnDelay = 5000;
    this.modeTimer = null;

    this.life = 3;
    this.score = 0;
    this.activeTween = null;

    this.currentMode = "scatter";
    this.isGameOver = false;
  }
  createAllGameObjects() {
    this.reset();

    this.map = this.make.tilemap({ key: "map" });
    const tileset = this.map.addTilesetImage("pacman tileset");
    this.layer = this.map.createLayer("Tile Layer 1", [tileset]);
    const scale = 2;
    // const cont = this.add.container(this.scale.width / 2, this.scale.height / 2);
    // // cont.add(this.layer);
    // cont.setScale(scale);
    // this.layer.setScale(scale);
    // this.layer.setPosition(this.scale.width / 2 - (this.layer.width / 2) * scale, this.scale.height / 2 - (this.layer.height / 2) * scale);
    // Create UI camera
    this.layer.setCollisionByExclusion(-1, true);
    this.pacman = this.physics.add.sprite(230, 432, "pacman");

    this.anims.create({
      key: "pacmanAnim",
      frames: [
        { key: "pacman" },
        { key: "pacman1" },
        { key: "pacman2" },
        { key: "pacman3" },
        { key: "pacman4" },
      ],
      frameRate: 10,
      repeat: -1,
    });
    this.pacman.play("pacmanAnim");
    this.physics.add.collider(this.pacman, this.layer);
    this.dots = this.physics.add.group();
    this.populateBoardAndTrackEmptyTiles(this.layer);
    this.physics.add.overlap(this.pacman, this.dots, this.eatDot, null, this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.detectIntersections();
    this.initializeGhosts(this.layer);
    let startPoint = { x: 232, y: 240 };
    this.pinkGhost.path = this.aStarAlgorithm(
      startPoint,
      this.PINKY_SCATTER_TARGET
    );
    this.pinkGhost.nextIntersection = this.pinkGhost.path.shift();

    this.blueGhost.path = this.aStarAlgorithm(
      startPoint,
      this.INKY_SCATTER_TARGET
    );
    this.blueGhost.nextIntersection = this.blueGhost.path.shift();

    this.orangeGhost.path = this.aStarAlgorithm(
      startPoint,
      this.CLYDE_SCATTER_TARGET
    );
    this.orangeGhost.nextIntersection = this.orangeGhost.path.shift();

    this.redGhost.path = this.aStarAlgorithm(
      startPoint,
      this.BLINKY_SCATTER_TARGET
    );
    this.redGhost.nextIntersection = this.redGhost.path.shift();

    this.scoreText = this.add
      .text(50, 20, `Score: ${this.score}`, {
        fontSize: 40,
        fontStyle: "bold",
        color: "#fff",
      })
      .setDepth(10);
    this.lifeText = this.add
      .text(650, 20, `Life: ${this.life}`, {
        fontSize: 40,
        fontStyle: "bold",
        color: "#fff",
      })
      .setDepth(10);

    this.soundIcon = this.add
      .image(865, 40, this.soundOn ? "soundOn" : "soundOff")
      .setScale(0.3)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(Infinity);
    this.pauseIcon = this.add
      .image(920, 40, this.soundOn ? "pause" : "resume")
      .setScale(0.3)
      .setInteractive()
      .setScrollFactor(0)
      .setDepth(Infinity);

    this.soundIcon.on("pointerdown", () => {
      if (this.playing) {
        this.tweens.add({
          targets: this.soundIcon,
          scale: 0.25,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: this.soundIcon,
              scale: 0.3,
              duration: 100,

              onComplete: () => {
                if (this.soundOn) {
                  this.sound.stopAll();

                  this.soundOn = false;

                  this.soundIcon.setTexture("soundOff");
                } else {
                  this.soundOn = true;
                  this.gameMusic.play();
                  this.soundIcon.setTexture("soundOn");
                }
              },
            });
          },
        });
      }
    });

    this.pauseIcon.on("pointerdown", () => {
      this.tweens.add({
        targets: this.pauseIcon,
        scale: 0.25,
        duration: 100,

        onComplete: () => {
          this.tweens.add({
            targets: this.pauseIcon,
            scale: 0.3,
            duration: 100,

            onComplete: () => {
              if (this.playing) {
                this.sound.stopAll();
                this.playing = false;
                this.pauseIcon.setTexture("resume");
                this.pinkGhost.body.velocity.x = 0;
                this.pinkGhost.body.velocity.y = 0;
                this.blueGhost.body.velocity.x = 0;
                this.blueGhost.body.velocity.y = 0;
                this.redGhost.body.velocity.x = 0;
                this.redGhost.body.velocity.y = 0;
                this.orangeGhost.body.velocity.x = 0;
                this.orangeGhost.body.velocity.y = 0;
                this.paused = this.add
                  .image(500, 600, "paused")
                  .setScrollFactor(0)
                  .setDepth(0)
                  .setScale(0.5);
                this.gameCamera.ignore([this.paused]);
              } else {
                this.playing = true;
                this.gameMusic.play();
                this.pauseIcon.setTexture("pause");
                this.paused.destroy();
              }
            },
          });
        },
      });
    });

    const mapCamera = this.cameras.add(
      0,
      0,
      this.scale.width,
      this.scale.height
    );
    mapCamera.setZoom(2);
    mapCamera.setScroll(-(this.layer.width / 2) - 35, -(this.layer.height / 2));
    mapCamera.ignore([this.background, this.scoreText, this.lifeText]); // ignore game objects

    this.gameCamera = this.cameras.main;
    this.gameCamera.ignore([
      this.layer,
      this.dots,
      this.pacman,
      this.pinkGhost,
      this.blueGhost,
      this.orangeGhost,
      this.redGhost,
    ]);
  }

  update() {
    if (this.playing) {
      if (this.isGameOver) return;
      this.handleDirectionInput();
      this.handlePacmanMovement();
      this.teleportPacmanAcrossWorldBounds();
      if (this.pinkGhost.enteredMaze) {
        this.handleGhostDirection(this.pinkGhost);
        this.handleGhostMovement(this.pinkGhost);
      }
      if (this.orangeGhost.enteredMaze) {
        this.handleGhostDirection(this.orangeGhost);
        this.handleGhostMovement(this.orangeGhost);
      }
      if (this.blueGhost.enteredMaze) {
        this.handleGhostDirection(this.blueGhost);
        this.handleGhostMovement(this.blueGhost);
      }
      if (this.redGhost.enteredMaze) {
        this.handleGhostDirection(this.redGhost);
        this.handleGhostMovement(this.redGhost);
      }
    }
  }

  reset() {
    this.pacman = null;
    this.direction = "null";
    this.previousDirection = "left";
    this.blockSize = 16;
    this.board = [];
    this.speed = 170;
    this.ghostSpeed = this.speed * 0.7;
    this.intersections = [];
    this.nextIntersection = null;
    this.oldNextIntersection = null;

    this.PINKY_SCATTER_TARGET = { x: 432, y: 80 };
    this.BLINKY_SCATTER_TARGET = { x: 32, y: 80 };
    this.INKY_SCATTER_TARGET = { x: 432, y: 528 };
    this.CLYDE_SCATTER_TARGET = { x: 23, y: 528 };

    this.scatterModeDuration = 7000;
    this.chaseModeDuration = 20000;
    this.entryDelay = 7000;
    this.respawnDelay = 5000;
    this.modeTimer = null;

    this.isGameOver = false;

    this.life = 3;
    this.score = 0;
    this.activeTween = null;
    this.currentMode = "scatter";

    this.initModeTimers();
  }

  initModeTimers() {
    this.setModeTimer(this.scatterModeDuration);
  }

  setModeTimer(duration) {
    if (this.modeTimer) this.modeTimer.destroy();
    this.modeTimer = this.time.delayedCall(duration, this.switchMode, [], this);
  }

  switchMode() {
    if (this.currentMode === "scatter") {
      this.currentMode = "chase";
      this.setModeTimer(this.chaseModeDuration);

      let blinkyChaseTarget = this.getChaseTarget(this.redGhost);
      this.updateGhostPath(this.redGhost, blinkyChaseTarget);

      let pinkyChaseTarget = this.getChaseTarget(this.pinkGhost);
      this.updateGhostPath(this.pinkGhost, pinkyChaseTarget);

      let clydeChaseTarget = this.getChaseTarget(this.orangeGhost);
      this.updateGhostPath(this.orangeGhost, clydeChaseTarget);

      let inkyChaseTarget = this.getChaseTarget(this.blueGhost);
      this.updateGhostPath(this.blueGhost, inkyChaseTarget);
    } else {
      this.currentMode = "scatter";
      this.setModeTimer(this.scatterModeDuration);

      let blinkyChaseTarget = this.BLINKY_SCATTER_TARGET;
      this.updateGhostPath(this.redGhost, blinkyChaseTarget);

      let pinkyChaseTarget = this.PINKY_SCATTER_TARGET;
      this.updateGhostPath(this.pinkGhost, pinkyChaseTarget);

      let clydeChaseTarget = this.CLYDE_SCATTER_TARGET;
      this.updateGhostPath(this.orangeGhost, clydeChaseTarget);

      let inkyChaseTarget = this.INKY_SCATTER_TARGET;
      this.updateGhostPath(this.blueGhost, inkyChaseTarget);
    }
  }

  getChaseTarget(ghost) {
    //let chaseTarget = null;

    if (ghost.texture.key === "redGhost") {
      return { x: this.pacman.x, y: this.pacman.y };
    }
    if (ghost.texture.key === "pinkGhost") {
      const offset = this.blockSize * 4;
      switch (this.direction) {
        case "right":
          return { x: this.pacman.x + offset, y: this.pacman.y };
        case "left":
          return { x: this.pacman.x - offset, y: this.pacman.y };
        case "up":
          return { x: this.pacman.x, y: this.pacman.y - offset };
        case "down":
          return { x: this.pacman.x, y: this.pacman.y + offset };
        default:
          return { x: this.pacman.x, y: this.pacman.y };
      }
    }
    if (ghost.texture.key === "orangeGhost") {
      const distance = Math.hypot(
        ghost.x - this.pacman.x,
        ghost.y - this.pacman.y
      );
      return distance > this.blockSize * 8
        ? { x: this.pacman.x, y: this.pacman.y }
        : this.CLYDE_SCATTER_TARGET;
    }
    if (ghost.texture.key === "blueGhost") {
      const blinky = this.redGhost;

      let pacmanAhead = { x: this.pacman.x, y: this.pacman.y };
      const aheadOffset = this.blockSize * 2;
      switch (this.direction) {
        case "right":
          pacmanAhead = { x: this.pacman.x + aheadOffset, y: this.pacman.y };
          break;
        case "left":
          pacmanAhead = { x: this.pacman.x - aheadOffset, y: this.pacman.y };
          break;
        case "up":
          pacmanAhead = { x: this.pacman.x, y: this.pacman.y - aheadOffset };
          break;
        case "down":
          pacmanAhead = { x: this.pacman.x, y: this.pacman.y + aheadOffset };
          break;
      }
      const vectorX = pacmanAhead.x - blinky.x;
      const vectorY = pacmanAhead.y - blinky.y;

      return { x: blinky.x + 2 * vectorX, y: blinky.y + 2 * vectorY };
    }
    //return chaseTarget;
  }

  updateGhostPath(ghost, chaseTarget) {
    let chaseStartPoint = { x: ghost.x, y: ghost.y };

    if (this.isInghostHouse(ghost.x, ghost.y)) {
      chaseStartPoint = { x: 232, y: 240 };
    }

    ghost.path = this.aStarAlgorithm(chaseStartPoint, chaseTarget);
    if (ghost.path.length > 0) ghost.nextIntersection = ghost.path.shift();
  }

  initializeGhosts(layer) {
    this.pinkGhost = this.initializeGhost(232, 290, "pinkGhost", layer);
    this.orangeGhost = this.initializeGhost(210, 290, "orangeGhost", layer);
    this.redGhost = this.initializeGhost(232, 290, "redGhost", layer);
    this.blueGhost = this.initializeGhost(255, 290, "blueGhost", layer);

    this.ghosts = [
      this.pinkGhost,
      this.orangeGhost,
      this.redGhost,
      this.blueGhost,
    ];
    this.startGhostEntries();
  }

  startGhostEntries() {
    this.ghosts.forEach((ghost, index) => {
      this.time.delayedCall(
        this.entryDelay * index,
        () => this.enterMaze(ghost),
        [],
        this
      );
    });
  }

  enterMaze(ghost) {
    ghost.setPosition(232, 280);
    ghost.enteredMaze = true;
  }

  initializeGhost(x, y, spriteKey, layer) {
    const ghost = this.physics.add.sprite(x, y, spriteKey);
    this.physics.add.collider(ghost, layer);
    this.physics.add.overlap(this.pacman, ghost, this.takeAttack, null, this);
    ghost.direction = "right";
    ghost.previousDirection = "right";
    ghost.nextIntersection = null;
    ghost.enteredMaze = false;
    return ghost;
  }

  takeAttack(pacman, ghost) {
    if (this.activeTween && this.activeTween.isActive()) return;
    this.life -= 1;
    if (this.soundOn) {
      this.lostSound.play();
    }
    this.lifeText.setText(`Life: ${this.life}`);
    this.activeTween = this.tweens.add({
      targets: pacman,
      loop: true,
      yoyo: true,
      alpha: 0.3,
      repeat: 3,
      duration: 150,
      onComplete: () => {
        pacman.setAlpha(1);
      },
    });
    ghost.setPosition(232, 290);

    if (this.life <= 0) {
      setTimeout(() => {
        let gameOverText = this.add
          .image(500, 600, "gameOver")
          .setScrollFactor(0)
          .setDepth(0)
          .setScale(0.5);
        this.gameCamera.ignore([gameOverText]);
      }, 500);
      this.playing = false;
      this.gameOver();
    }
  }

  isInghostHouse(x, y) {
    if (x <= 262 && x >= 208 && y <= 290 && y > 240) return true;
    else return false;
  }

  aStarAlgorithm(start, target) {
    const isInGhostHouse = this.isInghostHouse.bind(this);

    function findNearestIntersection(point, intersections) {
      let nearest = null;
      let minDist = Infinity;
      for (const intersection of intersections) {
        if (isInGhostHouse(intersection.x, intersection.y)) {
          continue;
        }
        const dist =
          Math.abs(intersection.x - point.x) +
          Math.abs(intersection.y - point.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = intersection;
        }
      }
      return nearest;
    }

    const startIntersection = findNearestIntersection.call(
      this,
      start,
      this.intersections
    );
    target = findNearestIntersection.call(this, target, this.intersections);

    if (!startIntersection || !target) {
      return [];
    }

    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();

    openList.push({
      node: startIntersection,
      g: 0,
      f: heuristic(startIntersection, target),
    });
    gScore.set(JSON.stringify(startIntersection), 0);

    function heuristic(node, target) {
      return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
    }

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift().node;

      if (current.x === target.x && current.y === target.y) {
        const path = [];
        let currentNode = current;
        while (cameFrom.has(JSON.stringify(currentNode))) {
          path.push(currentNode);
          currentNode = cameFrom.get(JSON.stringify(currentNode));
        }
        path.push(startIntersection);
        return path.reverse();
      }

      closedList.add(JSON.stringify(current));

      const currentIntersection = this.intersections.find(
        (i) => i.x === current.x && i.y === current.y
      );

      if (currentIntersection) {
        for (const direction of currentIntersection.openPaths) {
          const neighbor = this.getNextIntersection(
            current.x,
            current.y,
            direction
          );

          if (
            neighbor &&
            !isInGhostHouse(neighbor.x, neighbor.y) &&
            !closedList.has(JSON.stringify(neighbor))
          ) {
            const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;

            if (
              !gScore.has(JSON.stringify(neighbor)) ||
              tentativeGScore < gScore.get(JSON.stringify(neighbor))
            ) {
              gScore.set(JSON.stringify(neighbor), tentativeGScore);
              const fScore = tentativeGScore + heuristic(neighbor, target);
              openList.push({ node: neighbor, g: tentativeGScore, f: fScore });
              cameFrom.set(JSON.stringify(neighbor), current);
            }
          }
        }
      }
    }

    return [];
  }

  getNextIntersection(currentX, currentY, previousDirection) {
    let filteredIntersections;
    const isUp = previousDirection === "up";
    const isDown = previousDirection === "down";
    const isLeft = previousDirection === "left";
    const isRight = previousDirection === "right";
    filteredIntersections = this.intersections
      .filter((intersection) => {
        return (
          (isUp && intersection.x === currentX && intersection.y < currentY) ||
          (isDown &&
            intersection.x === currentX &&
            intersection.y > currentY) ||
          (isLeft &&
            intersection.y === currentY &&
            intersection.x < currentX) ||
          (isRight && intersection.y === currentY && intersection.x > currentX)
        );
      })
      .sort((a, b) => {
        if (isUp || isDown) {
          return isUp ? b.y - a.y : a.y - b.y;
        } else {
          return isLeft ? b.x - a.x : a.x - b.x;
        }
      });
    return filteredIntersections ? filteredIntersections[0] : null;
  }

  populateBoardAndTrackEmptyTiles(layer) {
    layer.forEachTile((tile) => {
      if (!this.board[tile.y]) {
        this.board[tile.y] = [];
      }
      this.board[tile.y][tile.x] = tile.index;
      if (
        tile.y < 4 ||
        (tile.y > 11 && tile.y < 23 && tile.x > 6 && tile.x < 21) ||
        (tile.y === 17 && tile.x !== 6 && tile.x !== 21)
      )
        return;
      let rightTile = this.map.getTileAt(
        tile.x + 1,
        tile.y,
        true,
        "Tile Layer 1"
      );
      let bottomTile = this.map.getTileAt(
        tile.x,
        tile.y + 1,
        true,
        "Tile Layer 1"
      );
      let rightBottomTile = this.map.getTileAt(
        tile.x + 1,
        tile.y + 1,
        true,
        "Tile Layer 1"
      );
      if (
        tile.index === -1 &&
        rightTile &&
        rightTile.index === -1 &&
        bottomTile &&
        bottomTile.index === -1 &&
        rightBottomTile &&
        rightBottomTile.index === -1
      ) {
        const x = tile.x * tile.width;
        const y = tile.y * tile.height;
        this.dots.create(x + tile.width, y + tile.height, "dot");
      }
    });
  }

  eatDot(pacman, dot) {
    // dot.disableBody(true, true);
    dot.destroy();
    this.score += 1;

    if (this.score > 300) {
      this.speed = 300;
      this.ghostSpeed = this.speed * 0.7;
    } else if (this.score > 200) {
      this.speed = 260;
      this.ghostSpeed = this.speed * 0.7;
    } else if (this.score > 100) {
      this.speed = 220;
      this.ghostSpeed = this.speed * 0.7;
    }

    this.scoreText.setText(`Score: ${this.score}`);
    // console.log(this.dots.children.size);
    if (this.dots.children.size <= 0) {
      this.populateBoardAndTrackEmptyTiles(this.layer);
      this.gameCamera.ignore([this.dots]);
    }
  }

  detectIntersections() {
    const directions = [
      { x: -this.blockSize, y: 0, name: "left" },
      { x: this.blockSize, y: 0, name: "right" },
      { x: 0, y: -this.blockSize, name: "up" },
      { x: 0, y: this.blockSize, name: "down" },
    ];
    const blockSize = this.blockSize;
    for (let y = 0; y < this.map.heightInPixels; y += blockSize) {
      for (let x = 0; x < this.map.widthInPixels; x += blockSize) {
        if (x % blockSize !== 0 || y % blockSize !== 0) continue;
        if (!this.isPointClear(x, y)) continue;
        let openPaths = [];
        directions.forEach((dir) => {
          if (this.isPathOpenAroundPoint(x + dir.x, y + dir.y)) {
            openPaths.push(dir.name);
          }
        });
        if (openPaths.length > 2 && y > 64 && y < 530) {
          this.intersections.push({ x: x, y: y, openPaths: openPaths });
        } else if (openPaths.length === 2 && y > 64 && y < 530) {
          const [dir1, dir2] = openPaths;
          if (
            ((dir1 === "left" || dir1 === "right") &&
              (dir2 === "up" || dir2 === "down")) ||
            ((dir1 === "up" || dir1 === "down") &&
              (dir2 === "left" || dir2 === "right"))
          ) {
            this.intersections.push({ x: x, y: y, openPaths: openPaths });
          }
        }
      }
    }
  }

  isPathOpenAroundPoint(pixelX, pixelY) {
    const corners = [
      { x: pixelX - 1, y: pixelY - 1 },
      { x: pixelX + 1, y: pixelY - 1 },
      { x: pixelX - 1, y: pixelY + 1 },
      { x: pixelX + 1, y: pixelY + 1 },
    ];
    return corners.every((corner) => {
      const tileX = Math.floor(corner.x / this.blockSize);
      const tileY = Math.floor(corner.y / this.blockSize);
      if (!this.board[tileY] || this.board[tileY][tileX] !== -1) {
        return false;
      }
      return true;
    });
  }

  isPointClear(x, y) {
    const corners = [
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ];
    return corners.every((corner) => {
      const tileX = Math.floor(corner.x / this.blockSize);
      const tileY = Math.floor(corner.y / this.blockSize);

      return !this.board[tileY] || this.board[tileY][tileX] === -1;
    });
  }

  handleDirectionInput() {
    const directions = ["left", "right", "up", "down"];
    for (const dir of directions) {
      const isArrowDown = this.cursors[dir]?.isDown;
      const isWasdDown = this.wasd[dir]?.isDown;

      if ((isArrowDown || isWasdDown) && this.direction !== dir) {
        this.previousDirection = this.direction;
        this.direction = dir;
        this.nextIntersection = this.getNextIntersectionInNextDirection(
          this.pacman.x,
          this.pacman.y,
          this.previousDirection,
          dir
        );
        break;
      }
    }
  }

  getNextIntersectionInNextDirection(
    currentX,
    currentY,
    currentDirection,
    nextDirection
  ) {
    let filteredIntersections;
    const isUp = currentDirection === "up";
    const isDown = currentDirection === "down";
    const isLeft = currentDirection === "left";
    const isRight = currentDirection === "right";
    filteredIntersections = this.intersections
      .filter((intersection) => {
        return (
          ((isUp &&
            intersection.x === currentX &&
            intersection.y <= currentY) ||
            (isDown &&
              intersection.x === currentX &&
              intersection.y >= currentY) ||
            (isLeft &&
              intersection.y === currentY &&
              intersection.x <= currentX) ||
            (isRight &&
              intersection.y === currentY &&
              intersection.x >= currentX)) &&
          this.isIntersectionInDirection(intersection, nextDirection)
        );
      })
      .sort((a, b) => {
        if (isUp || isDown) {
          return isUp ? b.y - a.y : a.y - b.y;
        } else {
          return isLeft ? b.x - a.x : a.x - b.x;
        }
      });
    return filteredIntersections ? filteredIntersections[0] : null;
  }

  isIntersectionInDirection(intersection, direction) {
    switch (direction) {
      case "up":
        return intersection.openPaths.includes("up");
      case "down":
        return intersection.openPaths.includes("down");
      case "left":
        return intersection.openPaths.includes("left");
      case "right":
        return intersection.openPaths.includes("right");
      default:
        return false;
    }
  }

  handlePacmanMovement() {
    let nextIntersectionx = null;
    let nextIntersectiony = null;
    if (this.nextIntersection) {
      nextIntersectionx = this.nextIntersection.x;
      nextIntersectiony = this.nextIntersection.y;
    }
    switch (this.direction) {
      case "left":
        this.handleMovementInDirection(
          "left",
          "right",
          this.pacman.y,
          nextIntersectiony,
          this.pacman.x,
          true,
          false,
          0,
          -this.speed,
          0,
          this.pacman.body.velocity.y
        );
        break;
      case "right":
        this.handleMovementInDirection(
          "right",
          "left",
          this.pacman.y,
          nextIntersectiony,
          this.pacman.x,
          true,
          true,
          180,
          this.speed,
          0,
          this.pacman.body.velocity.y
        );
        break;
      case "up":
        this.handleMovementInDirection(
          "up",
          "down",
          this.pacman.x,
          nextIntersectionx,
          this.pacman.y,
          false,
          true,
          -90,
          0,
          -this.speed,
          this.pacman.body.velocity.x
        );
        break;
      case "down":
        this.handleMovementInDirection(
          "down",
          "up",
          this.pacman.x,
          nextIntersectionx,
          this.pacman.y,
          false,
          true,
          90,
          0,
          this.speed,
          this.pacman.body.velocity.x
        );
        break;
    }
  }

  handleMovementInDirection(
    currentDirection,
    oppositeDirection,
    pacmanPosition,
    intersectionPosition,
    movingCoordinate,
    flipX,
    flipY,
    angle,
    velocityX,
    velocityY,
    currentVelocity
  ) {
    let perpendicularDirection =
      currentDirection === "left" || currentDirection === "right"
        ? ["up", "down"]
        : ["left", "right"];
    let condition = false;
    if (this.nextIntersection)
      condition =
        (this.previousDirection == perpendicularDirection[0] &&
          pacmanPosition <= intersectionPosition) ||
        (this.previousDirection == perpendicularDirection[1] &&
          pacmanPosition >= intersectionPosition) ||
        this.previousDirection === oppositeDirection;
    if (condition) {
      let newPosition = intersectionPosition;
      if (
        this.previousDirection != oppositeDirection &&
        newPosition !== pacmanPosition
      ) {
        if (currentDirection === "left" || currentDirection === "right")
          this.pacman.body.reset(movingCoordinate, newPosition);
        else this.pacman.body.reset(newPosition, movingCoordinate);
      }
      this.changeDirection(flipX, flipY, angle, velocityX, velocityY);
      this.adjustPacmanPosition(velocityX, velocityY);
    } else if (currentVelocity === 0) {
      this.changeDirection(flipX, flipY, angle, velocityX, velocityY);
      this.adjustPacmanPosition(velocityX, velocityY);
    }
  }

  adjustPacmanPosition(velocityX, velocityY) {
    if (this.pacman.x % this.blockSize !== 0 && velocityY > 0) {
      let nearestMultiple =
        Math.round(this.pacman.x / this.blockSize) * this.blockSize;
      this.pacman.body.reset(nearestMultiple, this.pacman.y);
    }
    if (this.pacman.y % this.blockSize !== 0 && velocityX > 0) {
      let nearestMultiple =
        Math.round(this.pacman.y / this.blockSize) * this.blockSize;
      this.pacman.body.reset(this.pacman.x, nearestMultiple);
    }
  }

  changeDirection(flipX, flipY, angle, velocityX, velocityY) {
    this.pacman.setFlipX(flipX);
    this.pacman.setFlipY(flipY);
    this.pacman.setAngle(angle);
    this.pacman.setVelocityY(velocityY);
    this.pacman.setVelocityX(velocityX);
  }

  teleportPacmanAcrossWorldBounds() {
    const worldBounds = this.physics.world.bounds;
    if (this.pacman.x <= worldBounds.x) {
      this.pacman.body.reset(
        worldBounds.right / 2 - this.blockSize,
        this.pacman.y
      );
      this.nextIntersection = this.getNextIntersectionInNextDirection(
        this.pacman.x,
        this.pacman.y,
        "left",
        this.direction
      );
      this.pacman.setVelocityX(-1 * this.speed);
    }
    if (this.pacman.x >= worldBounds.right / 2) {
      console.log(worldBounds.right);
      this.pacman.body.reset(worldBounds.x + this.blockSize, this.pacman.y);
      this.nextIntersection = this.getNextIntersectionInNextDirection(
        this.pacman.x,
        this.pacman.y,
        "right",
        this.direction
      );
      this.pacman.setVelocityX(this.speed);
    }
  }

  handleGhostDirection(ghost) {
    if (this.isInghostHouse(ghost.x, ghost.y)) {
      this.changeGhostDirection(ghost, 0, -this.ghostSpeed);
    }
    if (ghost.body.velocity.x == 0 && ghost.body.velocity.y == 0) {
      this.adjustGhostPosition(ghost);
    }

    let isAtIntersection = this.isGhostAtIntersection(
      ghost.nextIntersection,
      ghost.x,
      ghost.y,
      ghost.direction
    );

    if (isAtIntersection) {
      if (
        this.PINKY_SCATTER_TARGET.x === ghost.nextIntersection.x &&
        this.PINKY_SCATTER_TARGET.y === ghost.nextIntersection.y &&
        this.currentMode === "scatter" &&
        ghost.texture.key === "pinkGhost"
      )
        return;
      if (
        this.BLINKY_SCATTER_TARGET.x === ghost.nextIntersection.x &&
        this.BLINKY_SCATTER_TARGET.y === ghost.nextIntersection.y &&
        this.currentMode === "scatter" &&
        ghost.texture.key === "redGhost"
      )
        return;
      if (
        this.INKY_SCATTER_TARGET.x === ghost.nextIntersection.x &&
        this.INKY_SCATTER_TARGET.y === ghost.nextIntersection.y &&
        this.currentMode === "scatter" &&
        ghost.texture.key === "blueGhost"
      )
        return;
      if (
        this.CLYDE_SCATTER_TARGET.x === ghost.nextIntersection.x &&
        this.CLYDE_SCATTER_TARGET.y === ghost.nextIntersection.y &&
        this.currentMode === "scatter" &&
        ghost.texture.key === "orangeGhost"
      )
        return;

      if (this.currentMode === "chase") {
        let chaseTarget = this.getChaseTarget(ghost);
        this.updateGhostPath(ghost, chaseTarget);
      }

      if (ghost.path.length > 0) {
        ghost.nextIntersection = ghost.path.shift();
      }
      let newDirection = this.getGhostNextDirection(
        ghost,
        ghost.nextIntersection
      );
      ghost.previousDirection = ghost.direction;
      ghost.direction = newDirection;
    }
  }

  adjustGhostPosition(ghost) {
    if (ghost.x % this.blockSize !== 0) {
      let nearestMultiple =
        Math.round(ghost.x / this.blockSize) * this.blockSize;
      ghost.body.reset(nearestMultiple, ghost.y);
    }
    if (ghost.y % this.blockSize !== 0) {
      let nearestMultiple =
        Math.round(ghost.y / this.blockSize) * this.blockSize;
      ghost.body.reset(ghost.x, nearestMultiple);
    }
  }

  isGhostAtIntersection(intersection, currentX, currentY, direction) {
    const isUp = direction === "up";
    const isDown = direction === "down";
    const isLeft = direction === "left";
    const isRight = direction === "right";

    let condition =
      (isUp && intersection.x === currentX && intersection.y >= currentY) ||
      (isDown && intersection.x === currentX && intersection.y <= currentY) ||
      (isLeft && intersection.y === currentY && intersection.x >= currentX) ||
      (isRight && intersection.y === currentY && intersection.x <= currentX);
    return condition;
  }

  getGhostNextDirection(ghost, intersection) {
    if (
      Math.abs(intersection.x - ghost.x) < this.blockSize &&
      ghost.y <= intersection.y
    )
      return "down";
    if (
      Math.abs(intersection.x - ghost.x) < this.blockSize &&
      ghost.y >= intersection.y
    )
      return "up";
    if (
      Math.abs(intersection.y - ghost.y) < this.blockSize &&
      ghost.x <= intersection.x
    )
      return "right";
    if (
      Math.abs(intersection.y - ghost.y) < this.blockSize &&
      ghost.x >= intersection.x
    )
      return "left";
    return "up";
  }

  handleGhostMovement(ghost) {
    let nextIntersectionx = null;
    let nextIntersectiony = null;
    if (ghost.nextIntersection) {
      nextIntersectionx = ghost.nextIntersection.x;
      nextIntersectiony = ghost.nextIntersection.y;
    }
    switch (ghost.direction) {
      case "left":
        this.handleGhostMovementInDirection(
          ghost,
          "left",
          "right",
          ghost.y,
          nextIntersectiony,
          ghost.x,
          -this.ghostSpeed,
          0,
          ghost.body.velocity.y
        );
        break;
      case "right":
        this.handleGhostMovementInDirection(
          ghost,
          "right",
          "left",
          ghost.y,
          nextIntersectiony,
          ghost.x,
          this.ghostSpeed,
          0,
          ghost.body.velocity.y
        );
        break;
      case "up":
        this.handleGhostMovementInDirection(
          ghost,
          "up",
          "down",
          ghost.x,
          nextIntersectionx,
          ghost.y,
          0,
          -this.ghostSpeed,
          ghost.body.velocity.x
        );
        break;
      case "down":
        this.handleGhostMovementInDirection(
          ghost,
          "down",
          "up",
          ghost.x,
          nextIntersectionx,
          ghost.y,
          0,
          this.ghostSpeed,
          ghost.body.velocity.x
        );
        break;
    }
  }

  handleGhostMovementInDirection(
    ghost,
    currentDirection,
    oppositeDirection,
    ghostPosition,
    intersectionPosition,
    movingCoordinate,
    velocityX,
    velocityY,
    currentVelocity
  ) {
    let perpendicularDirection =
      currentDirection === "left" || currentDirection === "right"
        ? ["up", "down"]
        : ["left", "right"];
    let condition = false;
    if (ghost.nextIntersection)
      condition =
        (ghost.previousDirection == perpendicularDirection[0] &&
          ghostPosition <= intersectionPosition) ||
        (ghost.previousDirection == perpendicularDirection[1] &&
          ghostPosition >= intersectionPosition) ||
        ghost.previousDirection === oppositeDirection;
    if (condition) {
      let newPosition = intersectionPosition;
      if (
        ghost.previousDirection != oppositeDirection &&
        newPosition !== ghostPosition
      ) {
        if (currentDirection === "left" || currentDirection === "right")
          ghost.body.reset(movingCoordinate, newPosition);
        else ghost.body.reset(newPosition, movingCoordinate);
      }
      this.changeGhostDirection(ghost, velocityX, velocityY);
    } else if (currentVelocity === 0) {
      this.changeGhostDirection(ghost, velocityX, velocityY);
    }
  }

  changeGhostDirection(ghost, velocityX, velocityY) {
    ghost.setVelocityY(velocityY);
    ghost.setVelocityX(velocityX);
  }

  getOppositeDirection(direction) {
    switch (direction) {
      case "up":
        return "down";
      case "down":
        return "up";
      case "left":
        return "right";
      case "right":
        return "left";
      default:
        return "";
    }
  }
  getPerpendicularDirection(direction) {
    switch (direction) {
      case "up":
        return "right";
      case "down":
        return "left";
      case "left":
        return "up";
      case "right":
        return "down";
      default:
        return "";
    }
  }

  isMovingInxDirection(direction) {
    let result = direction === "left" || direction === "right" ? true : false;
    return result;
  }

  gameWin() {
    this.checkPlayerLost();
  }

  gameOver() {
    this.checkPlayerLost();
  }

  addSounds() {
    this.jumpSound = this.sound.add("jump");

    this.productSound = this.sound.add("product");

    this.lostSound = this.sound.add("lost");

    this.lostSound2 = this.sound.add("lost2");

    this.hoopSound = this.sound.add("woosh");
    this.gameMusic = this.sound.add("gameMusic", {
      volume: 1,
      loop: true,
    });
  }

  addScores() {
    this.score = 0;
    this.scoreText2 = this.add
      .text(400, 200, this.score, {
        fontFamily: "MyLocalFont",
        stroke: "#000000",
        fontSize: "80px",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(Infinity);
    this.scoreText2.setScale();
    this.scoreText2.setVisible(false);
  }

  instruction() {
    this.instructionGiven = false;

    if (!this.instructionGiven) {
      this.background = this.add
        .image(500, 600, "bonkBg")
        .setScrollFactor(0)
        .setDepth(0)
        .setAlpha(0.8);
      this.bonkLogo = this.add
        .image(500, 300, "bonkManLogo")
        .setScale(0.8)
        .setScrollFactor(0)
        .setDepth(0)
        .setAlpha(0.8);
      this.bonk = this.add
        .image(500, 550, "bonk")
        .setScale(0.2)
        .setScrollFactor(0)
        .setDepth(0)
        .setAlpha(0.8);
      this.playText = this.add
        .text(500, 800, "Click to Play", {
          fontFamily: "MyLocalFont",
          stroke: "#d95300",
          fontSize: "50px",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(2);

      this.option1 = this.add
        .image(500, 950, "goToLeaderboard")
        .setDepth(5)
        .setScrollFactor(0)
        .setAlpha(1)
        .setScale(1);
      this.option1.setInteractive();
      this.playText.setInteractive({ useHandCursor: true });
      this.option1.on("pointerdown", () => {
        this.tweens.add({
          targets: [this.option1],
          scale: 0.8,
          duration: 100,

          onComplete: () => {
            this.tweens.add({
              targets: [this.option1],
              scale: 1,
              duration: 100,
              onComplete: () => {
                this.screen = "leaderboard";

                this.cameras.main.fadeOut(500);
                setTimeout(() => {
                  this.cameras.main.fadeIn(500);
                  this.scene.restart();
                }, 500);
              },
            });
          },
        });
      });
      this.playTextClicked = false;

      this.playText.on("pointerdown", () => {
        if (!this.playTextClicked) {
          this.playTextClicked = true;
          this.tweens.add({
            targets: [this.playText],
            scale: 0.8,
            duration: 100,

            onComplete: () => {
              this.tweens.add({
                targets: [this.playText],
                scale: 1,
                duration: 100,
                onComplete: () => {
                  this.cameras.main.fadeOut(500);
                  setTimeout(() => {
                    this.createAllGameObjects();
                    this.start();
                    this.cameras.main.fadeIn(100);
                    this.playing = true;
                    this.playText.destroy();
                    this.option1.destroy();
                    this.bonkLogo.destroy();
                    this.bonk.destroy();
                    this.gameMusic.play();
                  }, 500);
                },
              });
            },
          });
        }
      });
    }
  }

  start() {
    this.playing = true;
  }

  // update() {
  //   if (this.playing) {
  //     this.gameBg.tilePositionX = this.cameras.main.scrollX;
  //     this.bg.tilePositionX = this.cameras.main.scrollX * 0.2;
  //     this.updateScore();
  //     this.updateCameraBounds();
  //     this.checkPlayerLost();
  //   }
  // }

  updateCameraBounds() {
    if (this.player) {
      if (!this.player.lost) {
        this.cameraBound = this.player.x - 500;
        // this.cameraBound = 100;
        this.cameras.main.setBounds(this.cameraBound, 0, 1200, 0, true);
      }
    }
  }
  checkPlayerLost() {
    // if (this.player && !this.player.lost) {
    //   if (this.player.y > 1000 || this.player.y < 0) {
    //     this.player.lost = true;
    //   }
    // }

    // if (this.player && this.player.lost && !this.player.ended) {
    // this.player.ended = true;
    this.tweens.add({
      targets: this.player,
      angle: 50,
      duration: 100, // time to reach -30
      ease: "Sine.easeOut",
    });
    // this.player.setVelocityX(0);

    this.sound.stopAll();

    if (this.soundOn) {
      this.lostSound.play();
      setTimeout(() => {
        this.lostSound2.play();
      }, 200);
    }

    this.time.addEvent({
      delay: 300,

      callback: () => {
        this.cameras.main.fadeOut(500);

        this.time.addEvent({
          delay: 1000,

          callback: () => {
            this.tempHighScore = this.highScore;

            if (this.score > this.highScore) {
              this.highScore = this.score;
            }

            localStorage.setItem("axa-bird-game-highScore", this.highScore);

            localStorage.setItem("axa-bird-game-score", this.score);

            this.playing = false;

            // console.log(this.remember, this.score);

            this.screen = "restart";
            this.scene.restart();
            this.cameras.main.fadeIn(500);
          },
        });
      },
    });
    // }
  }
  updateScore() {
    if (this.scoreText2) {
      this.scoreText2.setText(this.score);
    }
  }
}

const game = new Phaser.Game({
  parent: "game",
  type: Phaser.AUTO,
  width: 1000,
  height: 1200,
  border: 2,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
  input: {
    activePointers: 3,
  },
  scene: [Game],
});

window.oncontextmenu = (event) => {
  event.preventDefault();
};

console.warn = () => {
  return false;
};
