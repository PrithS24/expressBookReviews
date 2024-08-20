const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
 
    return users.some(user => user.username === username && user.password === password);
}

const authMiddleware = (req, res, next) => {
  if (req.session.authorization) {
      let token = req.session.authorization['accessToken'];

      // Verify JWT token
      jwt.verify(token, 'access', (err, user) => {
          if (!err) {
              req.user = user;
              next(); // Proceed to the next middleware
          } else {
              return res.status(403).json({ message: "User not authenticated" });
          }
      });
  } else {
      return res.status(403).json({ message: "User not logged in" });
  }
};



//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "Login Successful", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if(!req.session.authorization){
    return res.status(403).json({message:"User not loggen in"});
  }
  const token=req.session.authorization['accessToken'];
  const username=jwt.decode(token).username;

  const {isbn}=req.params;
  const {review}=req.body;

  if(!review){
    return res.status(400).json({message: "Review is required"});
  }
  if(!books[isbn]){
    return res.status(404).json({message:"Book not found"});
  }
  if(!books[isbn].reviews){
    books[isbn].reviews={};
  }
  books[isbn].reviews[username]=review;

  return res.status(200).json({message:"Review added succesfully"});
});

regd_users.delete("/auth/review/:isbn",authMiddleware,(req,res)=>{
  const {isbn} = req.params;
  const username = req.user.username;

  if(!books[isbn]){
    return res.status(404).json({message:"Book not found"});
  }
  if(!books[isbn].reviews || !books[isbn].reviews[username]){
    return res.status(404).json({ message: "Review not found or you are not the author of this review" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
})
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
