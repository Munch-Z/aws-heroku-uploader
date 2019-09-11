require("dotenv").config();

const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const path = require("path");
const PORT = process.env.PORT || 8080;

const bCrypt = require("bcrypt");

const db = require("./models");

console.log("The table is named: " + db.User);

//AUTHENTICATION
const passport = require("passport");
const session = require("express-session");

//VERY IMPORTANT SECRET
const secret = "your mom gay";

const authRoutes = require('./controllers/authcontroller');

//USE SECRET
app.use(session({ secret: secret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions

app.set("views", "./views");
app.use(express.static("./public"));

const bodyParser = require("body-parser");
//may need to replace with Body-parser methods
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, err => {
      if (err) throw err;
      console.log(`App listening on PORT: ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });

console.log(secret);
const USERID = "Zach";

AWS.config.region = "us-west-2";

//BUCKET ON AWS TO ACCESS
const S3_BUCKET = process.env.S3_BUCKET;

//INSTANTIATE NEW S3 WITH CORRECT KEYS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


app.use('/', authRoutes);


app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/accounts.html"));

  //gets info from database NEEDS TO BE PARSED INTO JSON
  s3.getObject({ Bucket: S3_BUCKET, Key: USERID + "/test.json" }, function(
    err,
    data
  ) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(
        "This is the content of the file that you are requesting: ",
        JSON.parse(data.Body)
      );
    }
  });
});

app.get("/collection", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/accounts.html"));

  //gets info from database NEEDS TO BE PARSED INTO JSON
  s3.getObject({ Bucket: S3_BUCKET, Key: USERID + "/collection.json" }, function(
    err,
    data
  ) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(
        "This is the content of the file that you are requesting: ",
        JSON.parse(data.Body)
      );
    }
  });
});

app.get("/decks", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/accounts.html"));

  //gets info from database NEEDS TO BE PARSED INTO JSON
  // s3.getObject({ Bucket: S3_BUCKET, Key: USERID + "/decks/" }, function(
  //   err,
  //   data
  // ) {
  //   if (err) {
  //     console.log("Error", err);
  //   } else {
  //     console.log(
  //       "This is the content of the file that you are requesting: ",
  //       JSON.parse(data.Body)
  //     );
  //   }
  // });

  s3.listObjects({Bucket: S3_BUCKET, Prefix: USERID + '/decks/', Delimiter: '/'}, (err, decks) => {
    if (err) throw err;

    console.log(decks.CommonPrefixes);

    console.log(getDeckNames(decks.CommonPrefixes));
  })
});


function getDeckNames(arr) {
  const decks = [];
  for(let i=0; i<arr.length; i++) {
    decks.push(arr[i].Prefix.split('/')[2]);
  }

  return decks;
}

app.get("/decklist", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/accounts.html"));

  //gets info from database NEEDS TO BE PARSED INTO JSON
  s3.getObject({ Bucket: S3_BUCKET, Key: USERID + "/decks/" + req.body.deckname + "/decklist.json" }, function(
    err,
    data
  ) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(
        "This is the content of the file that you are requesting: ",
        JSON.parse(data.Body)
      );
    }
  });
});

// app.get("/signin", (req, res) => {
//   //   get password from DB
//   db.User.findOne({
//     where: {
//       username: "Zamurph"
//     }
//   })
//     .then(data => {
//       //compare incoming password to hashed password from DB
//       bCrypt.compare("testing", data.password, (err, match) => {
//         if (err) throw err;

//         if (match)
//           res.sendFile(path.join(__dirname, "./views/authorized.html"));
//       });
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   res.sendFile(path.join(__dirname, "./views/signin.html"));
// });

// app.post("/createUser", (req, res) => {
//   const password = req.body.password;
//   //hash password
//   bCrypt.hash(password, 10, (err, hash) => {
//     if (err) throw err;

//     const newUser = {
//       username: req.body.username,
//       password: hash,
//       secret_answer: req.body.secret
//     };
//     //store hashed pass in the DB
//     db.User.create(newUser)
//       .then(data => {
//         console.log(data);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   });
// });

app.post("/createcollection", (req, res) => {
  //PARAMS OBJECKT FOR UPLOAD REQUEST
  const params = {
    Bucket: S3_BUCKET,
    Key: USERID + "/collection.json",
    Body: JSON.stringify(req.body.collection)
  };

  //UPLOAD FILE TO AWS AND THEN SEND IT BACK
  s3.upload(params, (s3Err, data) => {
    if (s3Err) throw s3Err;
    console.log(`File uploaded successfully at ${data.Location}`);
    res.sendStatus(200);
  });
});

app.post("/createdeck", (req, res) => {
  //PARAMS OBJECKT FOR UPLOAD REQUEST

  console.log(req.body);
  
  const params = {
    Bucket: S3_BUCKET,
    Key: USERID + "/decks/" + req.body.deckname + "/decklist.json",
    Body: JSON.stringify(req.body.decklist)
  };

  //UPLOAD FILE TO AWS AND THEN SEND IT BACK
  s3.upload(params, (s3Err, data) => {
    if (s3Err) throw s3Err;
    console.log(`File uploaded successfully at ${data.Location}`);
    res.sendStatus(200);
  });
});


app.post("/create", (req, res) => {
  //PARAMS OBJECKT FOR UPLOAD REQUEST
  const params = {
    Bucket: S3_BUCKET,
    Key: USERID + "/test.json",
    Body: JSON.stringify(req.body)
  };

  //UPLOAD FILE TO AWS AND THEN SEND IT BACK
  s3.upload(params, (s3Err, data) => {
    if (s3Err) throw s3Err;
    console.log(`File uploaded successfully at ${data.Location}`);
    res.sendStatus(200);
  });
});
