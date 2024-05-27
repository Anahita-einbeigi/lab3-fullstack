import express, { Request, Response } from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

async function setupDatabase() {
  const db = await open({
    filename: "./mydatabase.db",
    driver: sqlite3.Database
  });
  await db.exec(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, firstName TEXT, lastName TEXT, email TEXT UNIQUE, phone TEXT, password TEXT)"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS exercises (id INTEGER PRIMARY KEY, title TEXT, description TEXT, imageUrl TEXT)"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, exerciseId INTEGER, comment TEXT, FOREIGN KEY(exerciseId) REFERENCES exercises(id))"
  );
  await db.exec(`
    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY,
      name TEXT,
      specialization TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY,
      trainer_id INTEGER,
      date TEXT,
      time TEXT,
      location TEXT,
      FOREIGN KEY(trainer_id) REFERENCES trainers(id)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      session_id INTEGER,
      booking_date DATE,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    )
  `);
  return db;
}
const dbPromise = setupDatabase();

app.post("/api/users/register", async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, phone, password } = req.body;
  const db = await dbPromise;

  try {
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
      email
    ]);
    if (existingUser) {
      res.status(409).send("Användare med angiven e-postadress finns redan.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, phone, hashedPassword]
    );
    res
      .status(201)
      .send({ id: result.lastID, message: "Användare registrerad." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/users/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const db = await dbPromise;

  try {
    const user = await db.get<User>(
      "SELECT * FROM users WHERE email = ?",
      email
    );
    if (!user) {
      return res.status(404).json({ message: "Användaren finns inte." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.json({ message: "Du är inloggad!" });
    } else {
      res.status(401).json({ message: "Felaktigt lösenord." });
    }
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(500).json({ message: "Inloggningen misslyckades." });
  }
});

app.get("/api/exercises", async (req, res) => {
  const db = await dbPromise;
  try {
    const exercises = await db.all("SELECT * FROM exercises");
    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises: ", error);
    res.status(500).send("Error fetching exercises");
  }
});

app.post("/api/exercises", async (req: Request, res: Response) => {
  const { title, description, imageUrl } = req.body;
  const db = await dbPromise;
  try {
    const result = await db.run(
      "INSERT INTO exercises (title, description, imageUrl) VALUES (?, ?, ?)",
      [title, description, imageUrl]
    );
    res.status(201).json({ id: result.lastID, title, description, imageUrl });
  } catch (error) {
    console.error("Error creating exercise: ", error);
    res.status(500).json({ message: "Failed to create exercise." });
  }
});

app.get("/api/exercises/:id", async (req, res) => {
  console.log(`Request for exercise with ID: ${req.params.id}`);
  const { id } = req.params;
  const db = await dbPromise;

  try {
    const exercise = await db.get("SELECT * FROM exercises WHERE id = ?", [id]);
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).send("Exercise not found");
    }
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete(
  "/api/exercises/:exerciseId/comments/:commentId",
  async (req: Request, res: Response) => {
    const { exerciseId, commentId } = req.params;
    const db = await dbPromise;

    try {
      const result = await db.run(
        "DELETE FROM comments WHERE id = ? AND exerciseId = ?",
        [commentId, exerciseId]
      );
      if (result.changes && result.changes > 0) {
        res.status(204).send();
      } else {
        res.status(404).send("Comment not found");
      }
    } catch (error) {
      console.error("Error deleting comment: ", error);
      res.status(500).send("Error deleting comment");
    }
  }
);

app.get("/api/exercises/:id/comments", async (req: Request, res: Response) => {
  console.log("Received data:", req.body);
  const exerciseId = req.params.id;
  const db = await dbPromise;
  try {
    const comments = await db.all(
      "SELECT * FROM comments WHERE exerciseId = ?",
      exerciseId
    );
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments: ", error);
    res.status(500).send("Error fetching comments");
  }
});

app.post("/api/exercises/:id/comments", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const db = await dbPromise;

  try {
    const result = await db.run(
      "INSERT INTO comments (exerciseId, comment) VALUES (?, ?)",
      [id, text]
    );
    if (result.lastID) {
      const newComment = await db.get("SELECT * FROM comments WHERE id = ?", [
        result.lastID
      ]);
      res.status(201).json(newComment);
    } else {
      res.status(500).json({ error: "Failed to add comment." });
    }
  } catch (error) {
    console.error("Error adding comment: ", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
});

app.get("/api/sessions", async (req: Request, res: Response) => {
  const { start_date, end_date } = req.query;
  const db = await dbPromise;
  try {
    let sessions;
    if (start_date && end_date) {
      sessions = await db.all(
        "SELECT * FROM sessions WHERE date BETWEEN ? AND ?",
        [start_date, end_date]
      );
    } else {
      sessions = await db.all("SELECT * FROM sessions");
    }
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).send("Error fetching sessions");
  }
});

app.post("/api/sessions", async (req: Request, res: Response) => {
  const { trainer_id, date, time, location } = req.body;
  const db = await dbPromise;
  try {
    const result = await db.run(
      "INSERT INTO sessions (trainer_id, date, time, location) VALUES (?, ?, ?, ?)",
      [trainer_id, date, time, location]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Failed to create session." });
  }
});

app.post("/api/bookings", async (req: Request, res: Response) => {
  const { user_id, session_id } = req.body;
  const db = await dbPromise;
  try {
    const result = await db.run(
      "INSERT INTO bookings (user_id, session_id) VALUES (?, ?)",
      [user_id, session_id]
    );
    res.status(201).json({ id: result.lastID });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking." });
  }
});

app.get("/api/sessions", async (req: Request, res: Response) => {
  const { start_date, end_date } = req.query;
  const db = await dbPromise;
  try {
    let sessions;
    if (start_date && end_date) {
      sessions = await db.all(
        "SELECT * FROM sessions WHERE date BETWEEN ? AND ?",
        [start_date, end_date]
      );
    } else {
      sessions = await db.all("SELECT * FROM sessions");
    }
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).send("Error fetching sessions");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
