const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
} = require("firebase/database");
const dotenv = require("dotenv");
const cron = require("node-cron"); // ⏰ added for scheduled tasks

dotenv.config();

const firebase = initializeApp({
  apiKey: "AIzaSyALswdE4EclGpsyA4FYVcL0RYe9HZd6vf4",
  authDomain: "article-bcccc.firebaseapp.com",
  databaseURL: "https://article-bcccc-default-rtdb.firebaseio.com",
  projectId: "article-bcccc",
  storageBucket: "article-bcccc.appspot.com",
  messagingSenderId: "558259234111",
  appId: "1:558259234111:web:8b89fa061e0f5a7e189f8a",
});

const db = getDatabase(firebase);
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const getCodes = (score, codes = "[]") => {
  let unlocked = null;
  let newCodes = [];
  try {
    const _codes = JSON.parse(codes);
    if (Array.isArray(_codes)) {
      newCodes = _codes;
    }
  } catch (err) {
    console.log(err);
  }

  if (score >= 500 && !newCodes.find((cd) => cd.points === "500")) {
    const code = Math.floor(Math.random() * 900000) + 100000;
    unlocked = { points: "500", code };
    newCodes.push(unlocked);
  }

  if (score >= 1000 && !newCodes.find((cd) => cd.points === "1000")) {
    const code = Math.floor(Math.random() * 900000) + 100000;
    unlocked = { points: "1000", code };
    newCodes.push(unlocked);
  }

  if (score >= 5000 && !newCodes.find((cd) => cd.points === "5000")) {
    const code = Math.floor(Math.random() * 900000) + 100000;
    unlocked = { points: "5000", code };
    newCodes.push(unlocked);
  }

  return { codes: JSON.stringify(newCodes), unlocked };
};

const storeData = async (data, codes) => {
  try {
    await set(ref(db, `scores/${data.username}`), {
      username: data.username,
      email: data.email,
      score: data.score,
      news: data.news ? "Yes" : "No",
      codes: codes,
    }).then(() => {
      get(ref(db, "scores")).then((scoreValue) => {
        const dataValue = scoreValue.val();
        if (Object.keys(dataValue).length > 100) {
          const scores = Object.entries(dataValue)
            .map((score) => score[1])
            .sort((a, b) => b.score - a.score);

          scores.splice(-1, 1);

          const scoreData = {};
          scores.forEach((score) => {
            scoreData[score.username] = score;
          });

          set(ref(db, "scores"), scores);
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async (username) => {
  try {
    await remove(ref(db, `scores/${username}`));
  } catch (err) {
    console.log(err);
  }
};

const sendUserData = async (socket, username) => {
  try {
    const value = await get(ref(db, `scores/${username}`));
    if (value.exists()) {
      socket.emit("userData", value.val());
    }
  } catch (err) {
    console.log(err);
  }
};

// ✅ Clear leaderboard function
const clearLeaderboard = async () => {
  try {
    await set(ref(db, "scores"), null);
    console.log("Leaderboard cleared.");
    io.emit("leaderboardCleared");
  } catch (err) {
    console.error("Failed to clear leaderboard:", err);
  }
};
// clearLeaderboard();

// ✅ Run clearLeaderboard() every day at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Auto-clearing leaderboard at 12:00 AM...");
  await clearLeaderboard();
});

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("userData", (data) => {
    sendUserData(socket, data.username);
  });

  socket.on("scoreUpdate", async (data, callback) => {
    try {
      if (!data.username || data.username.length > 32) return;
      const value = await get(ref(db, `scores/${data.username}`));
      if (data.newUser) {
        if (value.exists()) {
          socket.emit("usernameTaken");
          callback(false);
        } else {
          const codeData = getCodes(data.score);
          await storeData(data, codeData.codes);
          await sendUserData(socket, data.username);
          callback({ ...data, unlocked: codeData.unlocked });
        }
      } else {
        if (value.exists()) {
          const dataValue = value.val();
          const score =
            dataValue.score < data.score ? data.score : dataValue.score;
          const codeData = getCodes(score, dataValue.codes);
          await update(ref(db, `scores/${data.username}`), {
            score: score,
            codes: codeData.codes,
          });
          sendUserData(socket, data.username);
          callback({ ...data, unlocked: codeData.unlocked });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("leaderboard", async () => {
    const value = await get(ref(db, "scores"));
    const scores = value.val();
    socket.emit("leaderboard", scores || []);
  });

  // ✅ Handle manual leaderboard clear via socket
  socket.on("clearLeaderboard", async (data) => {
    if (data?.username === "admin") {
      await clearLeaderboard();
    } else {
      socket.emit("errorClearingLeaderboard", "Not authorized.");
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

app.use(express.static(path.join(__dirname, "public")));

server.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
