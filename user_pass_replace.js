var replace = require("replace");
var user = process.argv[2];
var pass = process.argv[3];

replace({
  regex: "db_user",
  replacement: user,
  paths: ['./db_scripts', './routes', 'package.json', 'user_pass_replace.js'],
  recursive: true,
  silent: true
});

replace({
  regex: "admin",
  replacement: pass,
  paths: ['./routes', 'user_pass_replace.js'],
  recursive: true,
  silent: true
});