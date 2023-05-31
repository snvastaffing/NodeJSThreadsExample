const express = require("express");
const {Worker} = require("worker_threads")

const app = express();
const port = process.env.port || 3000;


app.get("/non-blocking/", async (req, res) => {
    res.status(200).send("this web page is non blocking");
})

function calculateCount(){
    return new Promise((resolve , reject)=>{
        let count = 0;
        for (let i = 0; i < 20_000_000_000; i++) {
            count++;
        }
        resolve(count);
    })
}
const thread_count= 4

function createWorker(){
    return new Promise(function (resolve, rej){
        const work = new Worker("./worker.js", {
            workerData:{thread_count:thread_count},
        });

        work.on("message",(data)=>{
            resolve(data);
        });
        work.on("error", (data)=>{
            res.status(200).send(`Error Occured  ${data}`);
        })

    })
}
app.get("/blocking/", async (req, res) => {
    const workerPromises = [];
    for (let i =0 ;i< thread_count; i++ ){
        workerPromises.push(createWorker());
    }
    
    const thread_results = await Promise.all(workerPromises);
    const total = thread_results[0]+thread_results[1]+thread_results[2]+thread_results[3];
    res.status(200).send(`the rsult is ${total}`)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})