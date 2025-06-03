import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Like from "./models/like.js";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Authentification réussie");
}).catch((err) => {
  console.error("Échec de la connexion", err.message);
});

// Route test
app.get("/", (req, res) => {
  res.send("Likes fonctionne correctement");
});

// Création like
app.post("/likes", async (req, res) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ error: "userId et postId sont nécessaires pour effectuer cette action" });
  }

  try {
    const existing = await Like.findOne({ userId, postId });
    if (existing) {
      return res.status(409).json({ error: "Like déjà enregistré pour ce post" });
    }

    const newLike = new Like({ userId, postId });
    await newLike.save();

    await axios.put(`${process.env.POSTS_SERVICE_URL}/posts/${postId}/increment-like`);

    res.status(201).json(newLike);
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

// Supprimer un like 
app.delete("/likes", async (req, res) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ error: "userId et postId sont nécessaires pour effectuer cette action" });
  }

  try {
    const deleted = await Like.findOneAndDelete({ userId, postId });

    if (!deleted) {
      return res.status(404).json({ error: "Like introuvable" });
    }

    await axios.put(`${process.env.POSTS_SERVICE_URL}/posts/${postId}/decrement-like`);

    res.json({ message: "Vous avez retiré votre like", deleted });
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

// Voir les likes
app.get("/likes", async (req, res) => {
  const { userId } = req.query;

  try {
    let filter = {};
    if (userId) {
      filter.userId = userId;
    }

    const likes = await Like.find(filter);
    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Likes-service sur http://localhost:${port}`);
});
