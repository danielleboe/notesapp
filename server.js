const express = require('express'); //import express
const fs = require('fs'); //import file system
const path = require('path'); //import path

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON body
app.use(express.json());
// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware for serving static files
app.use(express.static('public'));

//HTML Routess
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'notes.html'))
);

//get index.html file
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

//API Routes

//This line sets up a GET route at the /api/notes URL. When a GET request is made to this endpoint, the callback function provided is executed.
app.get('/api/notes', (req, res) => {

  //read the db.json file - db directory to the db.json file
  fs.readFile(path.join(__dirname, 'db','db.json'), 'utf8', (err, data) => {
    //error handling
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }

    //if no error, parse the json and send it as a json response to the client
    res.json(JSON.parse(data));
  });
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    const notes = JSON.parse(data);
    newNote.id = notes.length ? notes[notes.length - 1].id + 1 : 1;
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note' });
      }
      res.json(newNote);
    });
  });
});

// DELETE route
app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    const notes = JSON.parse(data);
    const updatedNotes = notes.filter(note => note.id !== noteId);
    fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(updatedNotes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ message: 'Note deleted' });
    });
  });
});

// Start server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);