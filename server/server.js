const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');

const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://lqhung:6zEAXDIIWI629M3r@cluster0.nlsywhz.mongodb.net/lab19';

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const createdDate = new Date()
      .toISOString()
      .replaceAll('-', '')
      .replaceAll(':', '')
      .replaceAll('.', '');
    cb(null, createdDate + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/images', express.static('images'));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.set('trust proxy', 1);
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,

    // secret: 'SESS_SECRET',
    // resave: false,
    // saveUninitialized: false,
    store: store,
    cookie: {
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60,
      // httpOnly: true,
    },
  })
);

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use(shopRoutes);
app.use(adminRoutes);
app.use(authRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });
