const mongoose = require("mongoose");
const Cipher = require("../utils/cipher");
const Helper = require("../utils/helper");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    api: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    timezone: {
      key: { type: String, },
      value: { type: String, },
    },
  }
);

// Static method to signup the user
userSchema.statics.signUp = function (userId) {
  return new Promise(async (resolve, reject) => {
    try {
      var [err, duser] = await Helper.to(this.findOne({ user_id: userId }));

      if (err) {
        throw err;
      }

      if (duser) {
        return resolve(duser);
      }

      // Create a new user instance
      const newUser = new this({
        userId,
        api: {
          apiKey: Cipher.createSecretKey(10),
          secretKey: Cipher.createSecretKey(16),
        },
      });

      // Save the user to the database
      await newUser.save();
      return resolve(newUser);
    } catch (err) {
      return reject(err);
    }
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
