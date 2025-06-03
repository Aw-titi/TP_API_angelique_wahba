import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/user.js";

dotenv.config();

import mongoose from "mongoose";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connexion réussie");
}).catch((err) => {
  console.error(" Erreur de connexion:", err.message);
});



app.get("/", (req, res) => {
  res.send("Auth fonctionne !");
});


app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs requis ne sont pas été renseignés." });
  }

  try {

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: "Ce nom d’utilisateur est déjà utilisé" });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();


    const { password: _, ...userSansMdp } = newUser.toObject();
    res.status(201).json(userSansMdp);
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Se connecter avec:", email, password);

  if (!email || !password) {
    return res.status(400).json({ error: " Veuillez renseigner votre email et votre mot de passe" });
  }

  try {
    const user = await User.findOne({ email });
    console.log("Utilisateur existant", user);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non existant" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe erroné" });
    }

    res.json({ message: "Vous êtes connecté", username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "Un email de réinitialisation sera envoyé si cet email correspond à un compte existant"
      });
    }

    return res.status(200).json({
      message: "Consultez votre boîte mail pour réinitialiser votre mot de passe"
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur 500", details: err.message });
  }
});



app.listen(port, () => {
  console.log(`Auth service sur http://localhost:${port}`);
});
