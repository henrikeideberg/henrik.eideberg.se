/*
 * See http://eloquentjavascript.net/16_game.html for more information
 * 
 * Henrik Eideberg, 2018
 * 
*/

/*
 * The plan for a small example level looks like below.
 * Explanattion
 *  - periods (.) are ampty space
 *  - hash character (#) represents walls,
 *  - plus signs (+) are lava
 *  - the at sign (@) marks the players starting position
 *  - Every 'o' character is a coin
 *  - the equal sign (=) at the top represents a block of lava that is
 *    moving back and forth.
 *  - the pipe character (|) create a vertically moving blob
 *  - the v character (v) indicates dripping lava.
 *
 * Designen för en liten bana ser ut som nedan.
 * Förklaring
 *  - punkter (.) representerar tom yta
 *  - hash (#) representerar väggar
 *  - plus tecknet (+) representerar lava
 *  - at tecknet (@) representerar spelarens startposition
 *  - bokstaven o representerar ett mynt
 *  - lika med tecknet (=) representerar en bit lava som rör sig fram
 *    och tillbaka
 *  - 'pipe' tecknet (|) representerar en vägg/bricka/golv som rör sig
 *    upp och ner
 *  - bokstaven v representerar droppande lava.
*/

var simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;//width 22 and height 9

/*
 * The following class stores a level object.
 * Its argument should be the string that defines the level.
*/
class Level {
  constructor(plan) {
    /*
     * Create rows; an array of arrays of characters.
     * Sse trim to remove white spaces at start and end of levelplan.
    */
    let rows = plan.trim().split("\n").map(l => [...l]);
    /*
     * Derive the levels height and width from the array rows.
    */
    this.height = rows.length;
    this.width = rows[0].length;
    /*
     * We will call moving elements 'actors'. The actors will be saved
     * in an array of objects. This is to seperate the moving elements
     * from the background elements.
    */
    this.startActors = [];

    /*
     * The background elements will be stored in an array of array of
     * strings holding strings like 'empty', 'wall' or 'lava'.
    */
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        /*
         * To interpret the characters in the plan, the level
         * constructor uses the levelChars object, which maps
         * background elements to strings and actor characters to
         * classes.
        */
        let type = levelChars[ch];
        if (typeof type == "string") return type;
        /*
         * When type is an actor class the static create method is
         * used to create an object which is added to the array
         * startActors. The background array will for this background
         * square/actor hold the string 'empty'.
        */
        this.startActors.push(
          type.create(new Vec(x, y), ch));
        return "empty";
      });
    });
  }
}

/*
 * As the game runs, actors will end up in different places or even
 * dissapear (as coins do when they are collected).
 * The State class is used to track the state of a running game.
*/
class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    //this.status switches to 'lost' or 'won' when the game has ended
    this.status = status;
  }

  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  get player() {
    return this.actors.find(a => a.type == "player");
  }
}

/*
**********************************************************************
**********************************ACTORS******************************
**********************************************************************
*/

/*
 * The Vec class will be used for our two-dimensional values of the
 * actors, such as the position and the size.
*/
class Vec {
  constructor(x, y) {
    this.x = x; this.y = y;
  }
  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  /*
   * Method to scale the a vector by a given number. It is usedful
   * when we need to multiply a speed vector by a time interval to get
   * the distance traveled during that time.
  */
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

class Player {
  constructor(pos, speed) {
    this.pos = pos;
    /*
     * this.speed stores the current speed,
     * to simulate momentum and gravity.
    */
    this.speed = speed;
  }

  get type() { return "player"; }

  static create(pos) {
    /*
     * Because a player is 1,5 squares high, the initial position is
     * set to be half a square (0,5) above the starting position
     * (marked by the at characyer (@)). This way the player bottom
     * aligns with the bottom of the square it appears in.
    */
    return new Player(pos.plus(new Vec(0, -0.5)),
                      new Vec(0, 0));
  }
}

/*
 * When constructing the lava object we need to construct it
 * differently based on the haracter that is based in to its
 * constructor. Dynamic lava moves along its current speed untill it
 * hits an obstacle. At that point, if the lava has a 'reset' property
 * it will 'jump' back to its original starting position 
 * (this is dripping lava). If the lava does not hava a 'reset'
 * property it will invert its speed and move in the other direction
 * (this is bouncing lava).
*/
class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get type() { return "lava"; }

  /*
   * The create method looks at the character that the Level
   * constructor passes and creates the appropiate lava actor.
  */
  static create(pos, ch) {
    if (ch == "=") {//horizontally bouncing lava
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {//vertically bouncing lava
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {//dripping laval
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }
}

/*
 * Coin classes are simple but will have a floating/wobbling
 * style/effect. To track this wobbling effect, a coin object storas a
 * base position as well as a wobble property that tracks the phase
 * of the bouncing motion. Together (base position property and wobble
 * property), these determine the coin's actual position (stored in
 * the pos property).
*/
class Coin {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get type() { return "coin"; }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    /*
     * The Math.sin method can give us the position of a point on a
     * circle. That coordinate goes back and forth in a smooth wave
     * form as we move along the circle. This makes the sine function
     * useful for modelling a wavy motion. To avoid a situation where
     * all coins wobble synchronosly, the starting pahse is
     * randomised. The 'phase' of Math.sin's wave (the widht of the
     * wave it produces) is 2*pi. By multiplying 2*pi with a random
     * value, a random starting position on the wave will be produced.
    */
    return new Coin(basePos, basePos,
                    Math.random() * Math.PI * 2);
  }
}

/*
 * The size property is the same for all instances of objects, so we
 * store the size property on the prototype rather than on the
 * instance itself. We could have used a get-size-function but that
 * would have created and returned a new Vec object everytime being
 * read/called.
*/
//Note: The player height is one and a half squares (1,5).
Player.prototype.size = new Vec(0.8, 1.5);
Lava.prototype.size = new Vec(1, 1);
Coin.prototype.size = new Vec(0.6, 0.6);

/*
**********************************************************************
**********************************DRAWING*****************************
**********************************************************************
*/

/*
 * The level's background display. This display will be the level's
 * background grid. The grid is drawn once and never changes. Actors
 * are redrawn every time the display is updated with a given state.
*/
class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", {class: "game"}, drawGrid(level));
    /*
     * The actorLayer will be used to track the element that holds
     * the actors so that they can be easily removed and replaced.
    */
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }
  clear() { this.dom.remove(); }
}

/*
 * The setState method is used to make the display show a given state.
 * It first removes the old actor graphics, if any, and then redraws
 * the actors in their new positions.
*/
DOMDisplay.prototype.setState = function(state) {
  if (this.actorLayer) this.actorLayer.remove();
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  /*
   * By adding the level’s current status as a class name to the
   * wrapper, we can style the player actor slightly differently when
   * the game is won or lost by adding a CSS rule that takes effect
   * only when the player has an ancestor element with a given class.
  */
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};

/*
 * We can’t assume that the level always fits in the viewport—the
 * element into which we draw the game. That is why the
 * scrollPlayerIntoView call is needed—it ensures that if the level is
 * protruding outside the viewport, we scroll that viewport to make
 * sure the player is near its center.
 *
*/
DOMDisplay.prototype.scrollPlayerIntoView = function(state) {
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let margin = width / 3;

  // The viewport
  let left = this.dom.scrollLeft, right = left + width;
  let top = this.dom.scrollTop, bottom = top + height;

  let player = state.player;
  /*
   * Find the player’s position and update the wrapping element’s
   * scroll position. 
   * The way the player’s center is found shows how the methods on our
   * Vec type allow computations with objects to be written in a
   * relatively readable way. To find the actor’s center, we add its
   * position (its top-left corner) and half its size. That is the
   * center in level coordinates, but we need it in pixel coordinates,
   * so we then multiply the resulting vector by our display scale.
  */
  let center = player.pos.plus(player.size.times(0.5))
                         .times(scale);

  /*
   * We change the scroll position by manipulating that element’s
   * scrollLeft and scrollTop properties when the player is too close
   * to the edge.
   * A series of checks verify that the player position isn’t outside
   * of the allowed range. Note that sometimes this will set nonsense
   * scroll coordinates, below zero or beyond the element’s scrollable
   * area. This is okay—the DOM will constrain them to acceptable
   * values. Setting scrollLeft to -10 will cause it to become 0.
   * It would have been slightly simpler to always try to scroll
   * the player to the center of the viewport. But this creates a
   * rather jarring effect. As you are jumping, the view will
   * constantly shift up and down. It is more pleasant to have a
   * “neutral” area in the middle of the screen where you can move
   * around without causing any scrolling.
  */
  if (center.x < left + margin) {
    this.dom.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    this.dom.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    this.dom.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    this.dom.scrollTop = center.y + margin - height;
  }
};

/*
 * Function to create DOM-element and give it some attributes and
 * child nodes. The rest parameter syntax allows us to represent an
 * indefinite number of arguments as an array.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * /Functions/rest_parameters
*/
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

/*
 * Function draw each actor by creating a DOM element for it and
 * setting that element’s position and size based on the actor’s
 * properties. The values have to be multiplied by scale to go from
 * game units to pixels.
*/
function drawActors(actors) {
  return elt("div", {}, ...actors.map(actor => {
    let rect = elt("div", {class: `actor ${actor.type}`});
    rect.style.width = `${actor.size.x * scale}px`;
    rect.style.height = `${actor.size.y * scale}px`;
    rect.style.left = `${actor.pos.x * scale}px`;
    rect.style.top = `${actor.pos.y * scale}px`;
    return rect;
  }));
}

/*
 * Our coordinates and sizes are tracked in grid units, where a size
 * or distance of 1 means 1 grid block. When setting pixel sizes,
 * we will have to scale these coordinates up—everything in the game
 * would be ridiculously small at a single pixel per square. The scale
 * constant gives the number of pixels that a single unit takes up on
 * the screen.
*/
const scale = 20;

/*
 * Function to draw the grid.
*/
function drawGrid(level) {
  return elt("table", {
    class: "background",
    style: `width: ${level.width * scale}px`
  }, ...level.rows.map(row =>
    elt("tr", {style: `height: ${scale}px`},
        ...row.map(type => elt("td", {class: type})))
  ));
}

/*
**********************************************************************
****************************MOTION AND COLLISION**********************
**********************************************************************
*/

/*
 * Method that tells whether a rectangle (specified by position and
 * size) touches a grid element of the given type.
*/
Level.prototype.touches = function(pos, size, type) {
  /*
   * Compute the set of grid squares that the body overlaps
   * with by using Math.floor and Math.ceil on its coordinates.
   * The grid squares are 1 by 1 units in size. By rounding the sides
   * of a box up and down, we get the range of background squares
   * that the box touches.
  */
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  /*
   * We loop over the block of grid squares found by rounding the
   * coordinates and return true when a matching square is found.
   * Squares outside of the level are always treated as "wall" to
   * ensure that the player can't leave the world and that we wont
   * accidentally try to read outside of the bounds of our rows array.
  */
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x >= this.width ||
                      y < 0 || y >= this.height;
      let here = isOutside ? "wall" : this.rows[y][x];
      if (here == type) return true;
    }
  }
  return false;
};

/*
 * The state update method uses touches to figure out if the player is
 * touching lava.
 * The method is passed a time step and a data structure that tells it
 * which keys are being held down.
*/
State.prototype.update = function(time, keys) {
  /*
   * Call the update method on all actors, producing an array of
   * updated actors. The actors get the time step, the keys, and the
   * state, so that they can base their update on those.
   * Only the player will actually read keys, since that’s the only
   * actor that’s controlled by the keyboard.
  */
  let actors = this.actors
    .map(actor => actor.update(time, this, keys));
  let newState = new State(this.level, actors, this.status);

  /*
   * If the game is already over, no further processing has to be done 
  */
  if (newState.status != "playing") return newState;

  /*
   * The method tests whether the player is touching background lava.
   * If so, the game is lost and we’re done. 
  */
  let player = newState.player;
  if (this.level.touches(player.pos, player.size, "lava")) {
    return new State(this.level, actors, "lost");
  }

  /*
   * Finally, if the game really is still going on, it sees if any
   * other actors overlap the player.
  */
  for (let actor of actors) {
    if (actor != player && overlap(actor, player)) {
      newState = actor.collide(newState);
    }
  }
  return newState;
};

/*
 * Overlap between actors is detected with the overlap function.
 * It takes two actor objects and returns true when they touch—which
 * is the case when they overlap both along the x axis and along the
 * y axis.
*/ 
function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
         actor1.pos.x < actor2.pos.x + actor2.size.x &&
         actor1.pos.y + actor1.size.y > actor2.pos.y &&
         actor1.pos.y < actor2.pos.y + actor2.size.y;
}

/*
 * If any actor does overlap, its collide method gets a chance to
 * update the state. Touching a lava actor sets the game status to
 * "lost", coins vanish when you touch them and set the status to
 * "won" when this was the last coin.
*/
Lava.prototype.collide = function(state) {
  return new State(state.level, state.actors, "lost");
};

Coin.prototype.collide = function(state) {
  let filtered = state.actors.filter(a => a != this);
  let status = state.status;
  if (!filtered.some(a => a.type == "coin")) status = "won";
  return new State(state.level, filtered, status);
};

/*
**********************************************************************
*******************************ACTOR UPDATES**************************
**********************************************************************
*/

/*
 * Method that computes a new position by adding the product of the
 * time step and the current speed to its old position.
 * If no obstacle blocks that new position, it moves there.
 * If there is an obstacle, the behavior depends on the type of the
 * lava block—dripping lava has a reset position, to which it jumps
 * back when it hits something. Bouncing lava inverts its speed by
 * multiplying it by -1, so that it starts moving in the opposite
 * direction.
*/
Lava.prototype.update = function(time, state) {
  let newPos = this.pos.plus(this.speed.times(time));
  if (!state.level.touches(newPos, this.size, "wall")) {
    return new Lava(newPos, this.speed, this.reset);
  } else if (this.reset) {
    return new Lava(this.reset, this.speed, this.reset);
  } else {
    return new Lava(this.pos, this.speed.times(-1));
  }
};

/*
 * Coins use this method to wobble. They ignore collisions with the
 * grid since they are simply wobbling around inside of their own
 * square. The wobble property is incremented to track time and then
 * used as an argument to Math.sin to find the new position on the
 * wave. The coin’s current position is then computed from its base
 * position and an offset based on this wave.
*/
const wobbleSpeed = 8, wobbleDist = 0.07;
Coin.prototype.update = function(time) {
  let wobble = this.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Coin(this.basePos.plus(new Vec(0, wobblePos)),
                  this.basePos, wobble);
};

/*
 * Player motion is handled separately per axis because hitting the
 * floor should not prevent horizontal motion, and hitting a wall
 * should not stop falling or jumping motion.
*/
const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;
Player.prototype.update = function(time, state, keys) {
  /*
   * The horizontal motion is computed based on the state of the left
   * and right arrow keys. When there’s no wall blocking the new
   * position created by this motion, it is used. Otherwise,
   * the old position is kept.
  */
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= playerXSpeed;
  if (keys.ArrowRight) xSpeed += playerXSpeed;
  let pos = this.pos;
  let movedX = pos.plus(new Vec(xSpeed * time, 0));
  if (!state.level.touches(movedX, this.size, "wall")) {
    pos = movedX;
  }

  /*
   * Vertical motion works in a similar way but has to simulate
   * jumping and gravity. The player’s vertical speed (ySpeed) is
   * first accelerated to account for gravity.
  */
  let ySpeed = this.speed.y + time * gravity;
  let movedY = pos.plus(new Vec(0, ySpeed * time));
  /*
   * We check for walls again. If we don’t hit any, the new position
   * is used. If there is a wall, there are two possible outcomes.
   * When the up arrow is pressed and we are moving down (meaning
   * the thing we hit is below us), the speed is set to a relatively
   * large, negative value. This causes the player to jump.
   * If that is not the case, the player simply bumped into something,
   * and the speed is set to zero.
  */
  if (!state.level.touches(movedY, this.size, "wall")) {
    pos = movedY;
  } else if (keys.ArrowUp && ySpeed > 0) {
    ySpeed = -jumpSpeed;
  } else {
    ySpeed = 0;
  }
  return new Player(pos, new Vec(xSpeed, ySpeed));
};

/*
**********************************************************************
*****************************TRACKING KEYS****************************
**********************************************************************
*/

/*
 * For a game like this, we do not want keys to take effect once per
 * keypress. Rather, we want their effect (moving the player figure)
 * to stay active as long as they are held.
 * We need to set up a key handler that stores the current state of
 * the left, right, and up arrow keys. We will also want to call
 * preventDefault for those keys so that they don’t end up scrolling
 * the page. The following function, when given an array of key names,
 * will return an object that tracks the current position of those
 * keys. It registers event handlers for "keydown" and "keyup" events
 * and, when the key code in the event is present in the set of codes
 * that it is tracking, updates the object.
*/
function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

const arrowKeys =
  trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

/*
**********************************************************************
***************************RUNNING THE GAME***************************
**********************************************************************
*/

/*
 * The requestAnimationFrame function, https://developer.mozilla.org/
 * en-US/docs/Web/API/window/requestAnimationFrame, provides a good
 * way to animate a game. But its interface is quite primitive. Using
 * it requires us to track the time at which our function was called
 * the last time around and call requestAnimationFrame again after
 * every frame.
 * The runAnimation method is a wrapper function that wraps those
 * boring parts in a convenient interface and allows us to simply call
 * runAnimation, giving it a function that expects a time difference
 * as an argument and draws a single frame. When the frame function
 * returns the value false, the animation stops.
 * 
*/
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      //Set a maximum frame step of 100 milliseconds
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/*
 * The runLevel function takes a Level object and a display
 * constructor, and returns a promise. It displays the level
 * (in document.body) and lets the user play through it. When the
 * level is finished (lost or won), runLevel waits one more second
 * (to let the user see what happens) and then clears the display,
 * stops the animation, and resolves the promise to the game’s end
 * status.
*/
function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise(resolve => {
    runAnimation(time => {
      state = state.update(time, arrowKeys);
      display.setState(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}

/*
 * The runGame method takes an array of level plans (strings) and
 * a disply constructor.
*/
async function runGame(plans, Display) {
  for (let level = 0; level < plans.length;) {
    let status = await runLevel(new Level(plans[level]),
                                Display);
    if (status == "won") level++;
  }
  console.log("You've won!");
}

/*
**********************************************************************
**********************************MAIN********************************
**********************************************************************
*/



/*
 * levelChars object which maps a plan character to either background
 * grid types or actor classes.
 *  . => empty
 *  # => wall
 *  + => lava
 *  @ => player
 *  o => coin
 *  = => lava
 *  | => lava
 *  v => lava
*/
const levelChars = {
  ".": "empty", "#": "wall", "+": "lava",
  "@": Player, "o": Coin,
  "=": Lava, "|": Lava, "v": Lava
};

/* Basic game
//Create a level instance a log it's height and width to console.
let simpleLevel = new Level(simpleLevelPlan);
console.log(`${simpleLevel.width} by ${simpleLevel.height}`);

//Display the level
let display = new DOMDisplay(document.body, simpleLevel);
display.setState(State.start(simpleLevel));
*/

