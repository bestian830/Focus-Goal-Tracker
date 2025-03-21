const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema - Defines the structure for user documents in MongoDB
 * 
 * Fields:
 * - email: User's email address (required for registered users)
 * - password: User's password (hashed, required for registered users)
 * - username: User's display name
 * - isGuest: Boolean flag indicating if this is a guest account
 * - googleId: Google OAuth ID for users who sign in with Google
 * - tempId: Temporary ID for linking guest data when converting to registered user
 * - createdAt: Timestamp when the user was created
 *             For guest users, this will be used to expire the document after 14 days
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true // Allows multiple null values (for guest users)
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if user is not a guest and not using Google login
      return !this.isGuest && !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  tempId: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Only expire guest accounts
    expires: function() {
      return this.isGuest ? 60 * 60 * 24 * 14 : undefined; // 14 days in seconds for guests
    }
  }
});

// Password hash middleware
UserSchema.pre("save", async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Note: We removed duplicate index definitions to resolve warnings
// The unique: true and sparse: true in the schema fields already create indexes

// Create and export the User model
module.exports = mongoose.model("User", UserSchema); 