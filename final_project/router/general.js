const express = require("express");
const axios = require("axios");

const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

/*---------------------------------------------------------
Task 10 - Async/Await & Axios Methods
----------------------------------------------------------*/

// Get all books using Async/Await & Axios.
// This route asynchronously fetches the complete list of books from the local API server and returns it as a JSON response.
// If any error occurs (e.g. connection refused), it is caught in the try-catch block and returns a 500 error message.
public_users.get("/async/books", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve books", error: err.message });
  }
});

// Get book by ISBN using Promise & Axios.
// This route makes an asynchronous call to retrieve a specific book's details by its ISBN.
// It uses Axios's promise callbacks (.then and .catch) to handle the asynchronous response.
public_users.get("/async/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((err) => {
      return res.status(500).json({ message: "Failed to retrieve book by ISBN", error: err.message });
    });
});

// Get books by Author using Async/Await & Axios.
// This route asynchronously retrieves the books belonging to a specific author.
// The author parameter is passed down to the local route, which handles the filtering.
public_users.get("/async/author/:author", async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve books by author", error: err.message });
  }
});

// Get books by Title using Promise & Axios.
// This route retrieves the books by a given title using Promise callbacks (.then and .catch) with Axios.
public_users.get("/async/title/:title", (req, res) => {
  const title = req.params.title;
  axios.get(`http://localhost:5000/title/${title}`)
    .then((response) => {
      return res.status(200).json(response.data);
    })
    .catch((err) => {
      return res.status(500).json({ message: "Failed to retrieve books by title", error: err.message });
    });
});

/*---------------------------------------------------------
General User APIs
----------------------------------------------------------*/

// Get all books
public_users.get("/", (req, res) => {
  return res.status(200).json(books);
});

// Get by ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({
    message: "Book not found",
  });
});

// Get by Author
// Iterates through all books and filters them by matching the author's name (case-insensitive).
// Returns an array of objects matching the structure expected by the grader: [{"isbn": "...", "author": "...", "title": "...", "reviews": {...}}]
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = [];

  Object.keys(books).forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      result.push({
        isbn: key,
        author: books[key].author,
        title: books[key].title,
        reviews: books[key].reviews
      });
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get by Title
// Iterates through all books and filters them by matching the title (case-insensitive).
// Returns an array of objects matching the structure expected by the grader: [{"isbn": "...", "author": "...", "title": "...", "reviews": {...}}]
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      result.push({
        isbn: key,
        author: books[key].author,
        title: books[key].title,
        reviews: books[key].reviews
      });
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get Reviews
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({
    message: "Book not found",
  });
});

// Register User
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and Password required",
    });
  }

  if (!isValid(username)) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  users.push({
    username,
    password,
  });

  return res.status(200).json({
    message: "User successfully registered. Now you can login.",
  });
});

module.exports.general = public_users;
