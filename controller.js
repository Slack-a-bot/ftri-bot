const db = require('../models/starWarsModels');


// const PG_URI = 'postgres://lliywdpi:lbD7NGtkj9g0TYsBDSCO1cQx38GY5Rgb@jelani.db.elephantsql.com/lliywdpi';
const PG_URI = 'postgres://eqsdjbff:PQGp5DNTRgLmpob5IBC2osIRbjZwsbv_@rajje.db.elephantsql.com/eqsdjbff'

// create a new pool here using the connection string above
const pool = new Pool({
  connectionString: PG_URI
});

module.exports = {
  query: (text, params, callback) => {
    console.log('executed query', text);
    return pool.query(text, params, callback);
  }
};

const testSQL = 'CREATE TABLE emojis (id SERIAL PRIMARY KEY, emoji_name VARCHAR(50) NOT NULL UNIQUE, emoji_link VARCHAR(50) NOT NULL)'

db.query(testSQL, (err, results) => {
  if(err) console.log(err);
  console.log(results)
})

const starWarsController = {};


// starWarsController.getCharacters = (req, res, next) => {
//   // write code here
//   const characterQueryStr = 'SELECT l.name, gender, l._id, birth_year, eye_color, skin_color, hair_color, mass, height, s.name AS species, p.name AS homeworld, l.homeworld_id, species_id FROM people l JOIN species s ON s._id = l.species_id JOIN planets p ON p._id = l.homeworld_id;';

//   const peopleInFilmsQueryStr = 'SELECT title, f._id AS id, person_id FROM films f JOIN people_in_films p ON p.film_id = f._id JOIN people l ON l._id = p.person_id';
  
//   Promise.all([db.query(characterQueryStr), db.query(peopleInFilmsQueryStr)])
//     .then((data) => {
//       const characters = data[0].rows;

//       const films = data[1].rows.sort((a, b) => { return a.person_id - b.person_id;});

//       for (const character of characters)  {
//         character.films = [];
//         for(const film of films) {
//           if (film.person_id == character._id) character.films.push(film);
//           if (film.person_id > character._id) break;
//         }
//       }

//       res.locals.characters = characters;
//       return next();
//     });
// };

starWarsController.getCharacters = (req, res, next) => {
  // gender, species, birth year, eye color, skin color, hair color, mass, height, homeworld
  const characterSQL = 'SELECT ppl.name, ppl.gender, s.name AS species,  ppl.birth_year, ppl.eye_color, ppl.skin_color, ppl.hair_color, ppl.mass, ppl.height, p.name AS homeworld, ppl.species_id AS species_id, ppl.homeworld_id AS homeworld_id FROM people ppl LEFT OUTER JOIN species s ON ppl.species_id = s._id LEFT OUTER JOIN planets p ON s.homeworld_id = p._id';
  db.query(characterSQL, function(err, results) {
    if (err) {
      next({
        log: `starWarsController.getCharacters: ERROR: ${err}`,
        message: { err: 'Error occurred in starWarsController.getCharacters. Check server logs for more details.' },
      });
    }
    console.log(results.rows);
    res.locals.characters = results.rows;
    // console.log(res.locals.characters);
    next();
  });
};
  
  //   .catch(err => next({
  //     log: `ERROR in starWarsController.getCharacters: ${err}`,
  //     message: { err: 'An error occurred' },
  //   }))

// starWarsController.getSpecies = (req, res, next) => {
//   // write code here
//   const speciesId = req.query.id;
//   const queryStr = 'SELECT classification, average_height, average_lifespan, language, s.name, p.name AS homeworld FROM species s FULL JOIN planets p ON s.homeworld_id = p._id WHERE s._id = $1 ;';

//   db.query(queryStr, [speciesId])
//     .then(speciesData => res.locals.speciesData = speciesData.rows[0])
//     .finally(() => next());
// };

starWarsController.getSpecies = async (req, res, next) => {
  // write code here
  // const sqlQuery = `SELECT species.name FROM species JOIN people ON people.species_id = species._id WHERE species._id = ${req.query.id};`;
  const sqlQuery = 'SELECT s.name, s.classification, s.average_height, s.average_lifespan, s.language, p.name AS homeworld FROM species s LEFT OUTER JOIN planets p ON s.homeworld_id = p._id WHERE s._id = $1';
  const values = [req.query.id];
  console.log('values', values)
  // const sqlQuery = `SELECT * FROM species WHERE species._id = ${req.query.id};`;
  try {
    const response = await db.query(sqlQuery, values);
    console.log('object at index 0', response.rows[0]);
    res.locals.species = response.rows[0];
    console.log(res.locals.species);
    next();
  } 
  catch (error) {
    console.log('catch');
    next(error);
  }
};

starWarsController.getHomeworld = (req, res, next) => {
  // write code here
  const homeworldId = req.query.id;
  const queryStr = 'SELECT name, rotation_period, orbital_period, diameter, climate, gravity, terrain, surface_water, population FROM planets WHERE planets._id = $1'
  
  db.query(queryStr, [homeworldId])
    .then(homeworldData => res.locals.homeworldData = homeworldData.rows[0])
    .finally(() => next());
};

starWarsController.getFilm = (req, res, next) => {
  // write code here
  const queryStr = 'SELECT title, episode_id, director, producer, release_date, _id FROM films WHERE _id = $1;';
  // 'SELECT title, f._id AS id FROM films f JOIN people_in_films p ON p.film_id = f._id JOIN people l ON l._id = p.person_id WHERE l._id = $1;';
  
  const filmId = req.query.id;
  db.query(queryStr, [filmId])
    .then(data => {
      console.log(data.rows[0]);
      res.locals.films = data.rows[0];
    })
    .finally(() => next());
};

starWarsController.addCharacter = (req, res, next) => {
  // write code here
  res.locals.newCharInfo = req.body;
  //species, homeworld, films
  const {name, gender, species, species_id, birth_year, eye_color, skin_color, hair_color, mass, height, homeworld, homeworld_id, films} = req.body;

  const queryStr = 'INSERT INTO people (name, gender, species_id, birth_year, eye_color, skin_color, hair_color, mass, height, homeworld_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);';
  const vals = [name, gender, species_id, birth_year, eye_color, skin_color, hair_color, mass, height, homeworld_id];

  db.query(queryStr, vals)
    .then(next())
    .catch(err => next({
      log: `ERROR in starWarsController.addCharacter: ${err}`,
      message: { err: 'An error occurred' },
    }));
};

module.exports = starWarsController;

      // for(const ppl of res.locals.characters) {
      //   const queryStr = 'SELECT title, f._id AS id FROM films f JOIN people_in_films p ON p.film_id = f._id JOIN people l ON l._id = p.person_id WHERE l._id = $1;';
      //   const peopleId = ppl._id
      //   db.query(queryStr,[peopleId])
      //     .then(filmData => ppl.filmData = filmData)
      // }