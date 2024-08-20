const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username) => {
  return users.some(user => user.username === username);
};

// Register endpoint
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (doesExist(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // res.send(JSON.stringify(books,null,4));
  const booksList = books; 

  
  Promise.resolve(booksList)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => {
      console.error('Error fetching books:', error);
      res.status(500).json({ message: 'Failed to retrieve books' });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // const isbn = parseInt(req.params.isbn, 10); 
  // const book = books[isbn]; 
  
  // if (book) {
  
  //   res.status(200).json(book);
  // } else {
  //   
  //   res.status(404).json({ message: "Book not found" });
  // }
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn]; 
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  })
  .then(book => {
    res.status(200).json(book);
  })
  .catch(error => {
    res.status(404).json({ message: error.message });
  });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  // let result=[];

  // for(let i in books){
  //   if(books[i].author==author){
  //     result.push(books[i]);
  //   }
  // }

  // if(result.length>0){
  //   res.status(200).json(result);
  // }else{
  //   res.status(404).json({message:"No books under this author's name"});
  // }

  new Promise((resolve,reject)=>{
    const result=Object.values(books).filter(book=>book.author===author);

    if(result.length>0){
      resolve(result);
    }else{
      reject(new Error("No books under this author's name"));
    }
  })
  .then(booksByAuthor=>{
    res.status(200).json(booksByAuthor);
  })
  .catch(error=>{
    res.status(404).json({message:error.message});
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  // let result=null;

  // for(let i in books){
  //   if(books[i].title==title){
  //     result=books[i];
  //     break;
  //   }
  // }
  // if(result){
  //   res.status(200).json(result);
  // }else{
  //   res.status(404).json({message:"No book found with this title!"});
  // }

  new Promise((resolve,reject)=>{
    const book=Object.values(books).find(book=>book.title===title);

    if(book){
      resolve(book);
    }else{
      reject(new Error("No book found with this title"));
    }
  })
  .then(book=>{
    res.status(200).json(book);
  })
  .catch(error=>{
    res.status(404).json({message: error.message});
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 const isbn=req.params.isbn;
 const book=books[isbn];

 if(book){
  res.status(200).json(book.reviews);
 }else{
  res.status(404).json({message:"Book not found with this ISBN"});
 }
});

module.exports.general = public_users;
