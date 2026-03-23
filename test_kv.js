import { Redis } from '@upstash/redis'


const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
})

async function test() {
    console.log("Setting Japanese string...")
    const testData = [{ id: "test1", name: "テスト案件", color: "bg-red-500" }]
    await redis.set('settings:projects:test_encoding', testData)
    
    console.log("Getting Japanese string...")
    const res = await redis.get('settings:projects:test_encoding')
    console.log(res)
}

test()
