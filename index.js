const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000
require('dotenv').config();
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tus40xp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const userCollection = client.db('E-Media').collection('users')
        const postCollection = client.db('E-Media').collection('post')
        const commentsCollection = client.db('E-Media').collection('comments')

        // save user in database
        app.post('/saveUser', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            if (result) {
                res.send(
                    {
                        status: true,
                        data: result
                    }
                )
            }
        })

        // save post in database
        app.post('/savePost', async (req, res) => {
            const post = req.body
            const result = await postCollection.insertOne(post)
            if (result) {
                res.send(
                    {
                        status: true,
                        data: result
                    }
                )
            }
        })

        // save comment in database
        app.post('/saveComment', async (req, res) => {
            const comment = req.body
            const result = await commentsCollection.insertOne(comment)
            if (result) {
                res.send(
                    {
                        status: true,
                        data: result
                    }
                )
            }
        })
        // get comment from database
        app.get('/comments/:id', async (req, res) => {

            const id = req.params.id
            const query = { postId: id }
            // const cursor = postCollection.find(query);
            const cursor = commentsCollection.find(query).sort({ time: -1 })
                ;
            const comments = await cursor.toArray()
            if (comments.length) {
                res.send({
                    status: true,
                    data: comments
                })
            }
            else {
                res.send({
                    status: true
                })
            }

        })

        // get All Posts from database
        app.get('/posts', async (req, res) => {

            const query = {}
            // const cursor = postCollection.find(query);
            const cursor = postCollection.find(query).sort({ time: -1 })
                ;
            const posts = await cursor.toArray()
            if (posts.length) {
                res.send({
                    status: true,
                    data: posts
                })
            }
            else {
                res.send({
                    status: true
                })
            }

        })

        // get Post details/singlePost from database
        app.get('/postDetails/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const postDetails = await postCollection.findOne(query)

            res.send({
                status: true,
                data: postDetails
            })


        })




    }
    finally {


    }

}
run().catch(error => console.error(error))



app.get('/', (req, res) => {
    res.send('E-Media server is running')
})
app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
})