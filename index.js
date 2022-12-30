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
        const reactCollection = client.db('E-Media').collection('reacts')

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
        })// add react in database
        app.post('/addReact', async (req, res) => {
            const reactInfo = req.body
            const result = await reactCollection.insertOne(reactInfo)
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
        // get userDetails by user Email
        app.get('/user/:email', async (req, res) => {
            const userEmail = req.params.email;

            const query = { email: userEmail }
            const userDetails = await userCollection.findOne(query)

            res.send({
                status: true,
                data: userDetails
            })


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

        // get All Posts by reactions
        app.get('/HomePagePost', async (req, res) => {
            const query = {}
            // const cursor = postCollection.find(query);
            const cursor = postCollection.find(query).sort({ react: -1 })
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

        // update user info
        app.put('/updateUserInfo/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedInfo = req.body
                const { name, address, university, userEmail } = updatedInfo

                const result = await userCollection.updateOne({ _id: ObjectId(id) }, { $set: { name: name, address: address, university: university } })

                const query = { userEmail: userEmail }
                const result2 = await postCollection.updateMany(query, { $set: { userName: name } })

                if (result.modifiedCount) {

                    res.send({
                        status: true
                    })
                }

            } catch (error) {
                console.log(error.name, error.message)
            }
        })

        // increase reaction by post
        app.put('/updateReaction/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedReactInfo = req.body
                const { react, userEmail } = updatedReactInfo
                // const reactedUsers = ['r@gmail.com']
                // const result = await postCollection.updateOne({ _id: ObjectId(id) }, { $set: { reactedUsers: reactedUsers } })
                const result = await postCollection.updateOne({
                    "_id": ObjectId(id),
                    "reactedUsers": { "$ne": userEmail }
                },
                    {
                        "$inc": { "react": 1 },
                        "$push": { "reactedUsers": userEmail }
                    })

                if (result.modifiedCount) {

                    res.send({
                        status: true
                    })
                }

            } catch (error) {
                console.log(error.name, error.message)
            }
        })



        // remove reation by post
        app.put('/removeReaction/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const userInfo = req.body
                const { userEmail } = userInfo
                // console.log(userEmail)
                const result = await postCollection.updateOne({
                    "_id": ObjectId(id),
                    "reactedUsers": userEmail
                },
                    {
                        "$inc": { "react": -1 },
                        "$pull": { "reactedUsers": userEmail }
                    })

                if (result.modifiedCount) {

                    res.send({
                        status: true
                    })
                }

            } catch (error) {
                console.log(error.name, error.message)
            }
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