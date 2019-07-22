import express from 'express';
import Joi from 'joi';
const app = express();

// Read a JSON obj from the body (Middleware)
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// only requests to /calendar/* will be sent to our "router"
var auth = express.Router();
var api = express.Router(); 

const courses = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    { id: 4, name: 'History' },
    { id: 5, name: 'Spanish' },
    { id: 6, name: 'Spanish' }
];

app.get('/', (req, res) => {
    res.send('this is a get request');
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
api.post('/courses', (res, req) => {

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

api.put('/courses/:id', (res, req) => {
    // 1 Look up the course
    // 2 If not exiting return 404
    // 3 Validate
    // 4 If invalid, return 404 -Bad request
    // Update course
    // 5 Return the updated course

    // Search for the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course){
        return res.status(404).send('This course with the given ID was not found');
    }

    // Schema for the validation using Joi
    // const result = validateCourse(req.body);

    // Schema for the validation using Joi and Object structuring
    const { error } = validateCourse(req.body);
    if ( error ) {
        res.status(400).send(error.details[0].message);
        return
    }

    // Update course 
    course.name = req.body.name;
    res.send(course);
});
api.delete('courses/:id', (req, res)=>{
    // Look up the course
    // Not existin, return 404
    // Delete the course
    // Return the same course

    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course){
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

// Assign a port from the environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Your server is running on port ${port}`)
});