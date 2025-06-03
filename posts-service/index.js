import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./models/post.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

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
  res.send("Posts fonctionne correctement");
});

// Créatoin d'un nouveau post
app.post("/posts", async (req, res) => {
  const { authorId, content } = req.body;

  if (!authorId || !content) {
    return res.status(400).json({ error: "L’identifiant et le contenu sont requis" });
  }

  try {
    const newPost = new Post({ authorId, content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

app.put("/posts/:id", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Veuillez saisir un contenu pour effectuer la modification" });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    res.json({ message: "Supression du post" });
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

// Incrémentation du compteur de likes
app.put("/posts/:id/increment-like", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    res.json({ message: "Like ajouté avec succès", post });
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

// Décrémentation du compteur de likes
app.put("/posts/:id/decrement-like", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: "Post introuvable" });
    }

    res.json({ message: "Votre like à été retiré", post });
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`Posts service sur http://localhost:${port}`);
});
