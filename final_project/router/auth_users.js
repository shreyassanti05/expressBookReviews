const express = require("express");
const jwt = require("jsonwebtoken");

let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) =>
      user.username === username &&
      user.password === password
  );
};

// Login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({
      message: "Username and password required",
    });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: username,
      },
      "access",
      {
        expiresIn: 60 * 60,
      }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).json({
      message: "User successfully logged in",
      accessToken,
    });
  }

  return res.status(208).json({
    message: "Invalid Login. Check username and password.",
  });
});

// Add / Modify Review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;

  const isbn = req.params.isbn;

  const review = req.query.review;

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews,
  });
});

// Delete Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;

  const isbn = req.params.isbn;

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];

    return res.status(200).json({
      message: `Review for ISBN ${isbn} deleted`,
    });
  }

  return res.status(404).json({
    message: "Review not found",
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
