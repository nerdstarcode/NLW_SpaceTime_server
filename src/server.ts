import fastify from 'fastify';
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'
import { memoriesRoutes } from './routes/memories';
import { authRoutes } from './routes/auth';
import axios from 'axios';

const app = fastify();

app.register(cors, {
    origin: true, //todas as urls de front podem acessar o backend,
    // origin: ['http://localhost:3333', 'dev', 'qa', 'prod]
})
app.register(jwt, {
    secret: 'spacetime',
})

app.register(authRoutes)
app.register(memoriesRoutes)

app.listen({
    port: 3333,
    host: '0.0.0.0',
}).then(() => {
    console.log('🚀 HTTP server running on http://localhost:3333 🚀')
});