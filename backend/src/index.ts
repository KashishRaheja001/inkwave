import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

type Env = {
  DATABASE_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

const prisma = new PrismaClient().$extends(withAccelerate())


app.get('/', (c) => {

  return c.text('Hello Hono!')
})

app.post('/api/v1/signup', async (c)=>{
  const body = await c.req.json()
  const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())


  const user = await prisma.user.create({
    data:{
      username: body.username,
      email : body.email,
      password : body.password,

    },
  })

  const token = await sign({id: user.id} , c.env.JWT_SECRET)
  return c.json({token})
})

app.post('/api/v1/signin', async (c)=>{
    const body = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    
    const user = await prisma.user.findUnique({
      where: {
        username : body.username
      },
    })

    if(!user){
      c.status(403)
      return c.json({
        error : "user not found"
      })
    }

    const token =await sign({id: user.id}, "my-secret")
    return c.json({token})

})

app.post('/api/v1/blog', async (c)=>{

})

app.put('/api/v1/blog', (c)=>{

})

app.get('/api/v1/blog/:id', (c)=>{

})



export default app