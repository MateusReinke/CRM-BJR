import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { handleError, successResponse } from "./utils/errorHandler";
import { sendPasswordResetEmail } from "./utils/mailer";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// The reset-token fields never need to leave the server - strip them before
// a user row goes into an API response.
function toPublicUser(user: SelectUser) {
  const { resetPasswordTokenHash, resetPasswordTokenExpiresAt, ...publicUser } = user;
  return publicUser;
}

// Public self-registration must never let the caller pick their own role or
// activation state - both are stripped from the request and role is pinned
// to the lowest privilege. An admin promotes accounts afterwards from the
// Funcionários screen (PUT /api/employees/:id, which IS role-gated).
const publicRegisterSchema = insertUserSchema.omit({ role: true, isActive: true });

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: isProduction, // Require HTTPS in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // CSRF protection
    },
    name: 'bjr.sid', // Don't use default session name
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Nome de usuário já existe" });
      }

      const validatedData = publicRegisterSchema.parse(req.body);

      const user = await storage.createUser({
        ...validatedData,
        role: 'mechanic',
        isActive: true,
        password: await hashPassword(validatedData.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(successResponse(toPublicUser(user)));
      });
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(successResponse(toPublicUser(req.user!)));
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(successResponse(toPublicUser(req.user)));
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      // Only act if the e-mail matches an account, but always send back the
      // same response either way - otherwise this endpoint could be used to
      // find out which e-mails have an account here.
      if (user) {
        const rawToken = randomBytes(32).toString("hex");
        await storage.setPasswordResetToken(
          user.id,
          hashResetToken(rawToken),
          new Date(Date.now() + RESET_TOKEN_TTL_MS),
        );

        const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${rawToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);
      }

      res.status(200).json(
        successResponse({
          message: "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.",
        }),
      );
    } catch (error) {
      handleError(error, res);
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const user = await storage.getUserByValidResetToken(hashResetToken(token));

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Link inválido ou expirado. Solicite uma nova redefinição de senha.",
        });
      }

      await storage.resetPassword(user.id, await hashPassword(password));
      res.status(200).json(successResponse({ message: "Senha redefinida com sucesso." }));
    } catch (error) {
      handleError(error, res);
    }
  });
}
