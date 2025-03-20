const mongoose = require("mongoose");

/**
 * User Schema - Defines the structure for user documents in MongoDB
 * 
 * Fields:
 * - username: User's display name
 * - isGuest: Boolean flag indicating if this is a guest account
 * - createdAt: Timestamp when the user was created
 *             For guest users, this will be used to expire the document after 14 days
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 14 // 14 days in seconds - after this time, guest documents will be automatically deleted
  }
});

// Create and export the User model
module.exports = mongoose.model("User", UserSchema); 