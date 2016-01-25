var replace = require("replace");
var user = process.argv[2];
var pass = process.argv[3];
console.log(user);
replace({
  regex: "db_user",
  replacement: user,
  paths: ['./db_scripts', 'app.js', 'package.json'],
  recursive: true,
  silent: true
});

replace({
  regex: "password",
  replacement: pass,
  paths: ['app.js', 'user_pass_replace.js'],
  recursive: true,
  silent: true
});