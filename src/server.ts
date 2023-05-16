import fastify from 'fastify';
import { PrismaClient } from '@prisma/client'
const app = fastify();
const prisma = new PrismaClient();

app.get('/hello', async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer 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");

    var raw = JSON.stringify({
        "model": "text-davinci-003",
        "prompt": "Diga olá para mim com uma frase de boas vindas em português",
        "max_tokens": 50,
        "temperature": 1.4
    });
    const response = await fetch("https://api.openai.com/v1/completions", {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    })
        .then((response: any) => {
            return response.json()
        })
        .catch(error => error)
    response.object
    return response.choices[0].text
})

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany()
    .then(users => {
        res.code(200).send(users)
    })
    .catch(err => {
        res.send(err)
    })

})

app.listen({
    port: 3333,
}).then(() => {
    console.log('🚀 HTTP server running on http://localhost:3333 🚀')
});