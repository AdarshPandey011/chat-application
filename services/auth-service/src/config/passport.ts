import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
}, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { providerId: profile.id }
          ]
        }
      });

      if (user) {
        // Update provider info if needed
        if (!user.providerId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              providerId: profile.id,
              provider: 'google',
              avatar: profile.photos?.[0]?.value
            }
          });
        }
        return done(null, user);
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.emails?.[0]?.value || '',
          username: profile.displayName?.toLowerCase().replace(/\s+/g, '') + '_' + profile.id.slice(-6),
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          avatar: profile.photos?.[0]?.value,
          provider: 'google',
          providerId: profile.id
        }
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to generate JWT token
export const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      username: user.username 
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
