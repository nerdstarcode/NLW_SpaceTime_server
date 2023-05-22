import { FastifyInstance } from "fastify";
import axios from 'axios'
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reponse) => {
    console.log(request.body)
    const bodySchema = z.object({
      code: z.string(),
      where: z.string()
    })
    const { code, where } = bodySchema.parse(request.body)
    const client_id = where === 'web' && process.env.GITHUB_CLIENT_ID_WEB || where === 'mobile' && process.env.GITHUB_CLIENT_ID_MOBILE
    const client_secret = where === 'web' && process.env.GITHUB_CLIENT_SECRET_WEB || where === 'mobile' && process.env.GITHUB_CLIENT_SECRET_MOBILE
    const acessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id,
          client_secret,
          code
        },
        headers: {
          Accept: 'application/json',
        }
      }
    )
    const { access_token } = acessTokenResponse.data

    const userResponse = await axios.get(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      avatar_url: z.string().url(),
      name: z.string()
    })

    const userInfo = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubID: userInfo.id
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubID: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url
        }
      })
    }
    const token = app.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl,
    }, {
      sub: user.id,
      expiresIn: '30 days'
    })
    return {
      token
    }
  })
}