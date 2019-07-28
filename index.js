import express from 'express';
import Joi from 'joi';  // Middleware validator
import favicon from 'serve-favicon' // Middleware for the Icon on the top of the page
import path from 'path'
import bird from './birdRouter';    // Routers in another file (birdRouter)

const app = express();

// Using the bird router file
app.use('/bird', bird);

//This is for the public folder on path
// http://localhost:3000/favicon.ico
app.use(express.static('public'));

// Load image from folder
// http://localhost:3000/images/face.jpg
app.use('/images', express.static('images'))

// Read a JSON obj from the body (Middleware)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware for the Icon on the top of the page
// The icon should be in the public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// only requests to /calendar/* will be sent to our "router"
const auth = express.Router();
const api = express.Router();

const courses = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    { id: 4, name: 'History' },
    { id: 5, name: 'Spanish' },
    { id: 6, name: 'Spanish' }
];

// Chaining Example
app.route('/item')
    .get((req, res) => {
        // Throw an error and cathing it in the botton
        throw new Error()
    })
    .put((req, res) => {
        res.send('this is a put request');
    })
    .delete((req, res) => {
        res.send('this is a delete request');
    })

// Different types of responses
// http://localhost:3000/
app.get('/', (req, res) => {
    // res.send('this is a get request');
    // res.end();
    // res.redirect('https://www.linkedin.com/in/oscarmmalo/');
    res.download('images/face.jpg');
    // res.json({ user: 'Oscar'});
    // res.status(500).json({error:'message'});
});

auth.get('/login', (req, res) => {
    res.send("this is a auth route");
    // res.status(500).send('Something broke!')
});

// One param Send the id form this URL http://localhost:3000/api/cour/9
api.get('/cour/:id', (req, res) => {
    res.send(req.params.id);
});

// http://localhost:3000/api/post/2009/10
// Multiples params This return {"year":"2009","month":"10"}
api.get('/post/:year/:month', (req, res) => {
    res.send(req.params);
});

// http://localhost:3000/api/post/2009/10?sortBy=name
// Get the query string parameter return {"sortBy":"name"}
api.get('/product/:year/:month', (req, res) => {
    res.send(req.query);
});

// Return the curse with the Id passed URL 
// Succed http://localhost:3000/api/courses/3
// Error http://localhost:3000/api/courses/23
api.get('/courses/:id', (req, res) => {

    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        res.status(404).send('This course was not found');
    } else {
        res.send(course);
    }
});

// Since reading a JSON object from the body is not enable for default
// Add the express.json() middleware on the top app.use(express.json());
api.post('/courses', (req, res) => {

    // This is the schema for the validation using Joi
    const schema = {
        name: Joi.string().min(3).required()
    }

    const result = Joi.validate(req.body, schema);
    console.log(result);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

api.put('/courses/:id', (req, res) => {
    // 1 Look up the course
    // 2 If not exiting return 404
    // 3 Validate
    // 4 If invalid, return 404 -Bad request
    // Update course
    // 5 Return the updated course

    // Search for the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('This course with the given ID was not found');
    }

    // Schema for the validation using Joi
    const result = validateCourse(req.body);

    // Schema for the validation using Joi and Object structuring
    const { error } = validateCourse(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return
    }

    // Update course 
    course.name = req.body.name;
    res.send(course);
});

api.delete('courses/:id', (req, res) => {
    // Look up the course
    // Not existin, return 404
    // Delete the course
    // Return the same course

    // Return the reference to the course found
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        return res.status(404).send('This course with the given ID was not found');
    }

    const index = courses.indexOf(course);
    courses.slice(index, 1);

    res.send(course);
});

function validateCourse(course) {
    // Schema for the validation using Joi
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(course, schema);
}

app.use('/auth', auth);
app.use('/api', api);

// Error handling function
app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send(`Read alert ${err.stack}`);
})

// Assign a port from the environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Your server is running on port ${port}`)
});