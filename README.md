# Hackday Dungeon

Welcome to the Hackday Dungeon! Whether you're here as a proud programmer keen
on proving your coding skills in a contest of wits, or a newbie developer
looking to have some fun practising their scripting skills in a friendly
competition, or a criminal condemned to play this game for the crime of hacking
secret government supercomputers, you're now tasked with beating your opponents
through the power of CODING.

The Hackday Dungeon is a multiplayer programming/scripting game where
pre-programmed bots fight each other. Each player submits a script (in
JavaScript, Ruby, C++, etc) controlling their bot to the Hackday Dungeon engine,
(managed by your friendly Dungeon Master,) which proceeds to process each bot's
pre-programmed actions until a victor is determined.

This project repository that you're looking at is concerned mostly with the
**front-end/visualisation** aspect of the Hackday Dungeon game system, as
opposed to the engine that processes each player's script/each bot's actions.

## Development

- This is a web app built on HTML5, JavaScript and CSS.
- It uses Babel to transpile 'modern' ES6 code into 'current' (2018)
  JavaScript code.
- It uses Webpack to bundle JS files together. (Important for making the
  transpiled ES6 'import' functionality work.)
- Its also uses Stylus to make writing CSS easier.
- Developing the web app requires Node.js installed on your machine and a handy
  command line interface. (Bash, cmd.exe, etc)
- However, the _compiled_ web app itself can be run simply by opening the
  `index.html` in a web browser. (Chrome, Firefox, etc)

Project anatomy:

- Source JS (ES6 JavaScript) and STYL (Stylus CSS) files are in the `/src`
  folder.
- Compiled JS and CSS files are in the `/app` folder.
- Media assets are meant to be placed in the `/assets` folder, but this is
  optional.
- Entry point is `index.html`.

Starting the project:

1. Install the project dependencies by running `npm install`
2. Run `npm start` to start the server.
3. Open `http://localhost:3000` on your browser to view the app.

Alternatively, there's a developer mode:

1. `npm install`
2. `npm run dev`
3. `http://localhost:3000`
4. Changes to the JS and STYL files will now be compiled automatically; i.e.
   Babel/Webpack and Stylus now _watch_ the files. Refreshing the browser window
  should should show the latest edits.
