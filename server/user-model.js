const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// "Salt round" is like a cost factor.
// It controls how much time is needed to calculate a BCrypt hash.
// With every increase of 1, the time doubles
// Higher # means harder to brute force
const saltRounds = 12;

// Initialize mongoose model
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    // Possible to have multiple scopes like 'read:resource write:resource ...'
    default: 'read:resource'
  },
});

userSchema.pre('save', async function(next) {
  try {
    const user = this;

    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
    next();

  } catch(err) {
    console.log('Error hashing user password in pre-save hook:', err);
    next(err);
  }
});

userSchema.methods.comparePassword = (candidatePassword, next) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return next(err);
    }
    next(null, isMatch)
  });
}

module.exports = mongoose.model('User', userSchema);
