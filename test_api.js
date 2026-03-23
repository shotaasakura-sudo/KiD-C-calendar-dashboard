async function test() {
    const body = { projects: [{ id: "test1", name: "テスト案件", color: "bg-red-500" }] }
    
    console.log("Sending POST Request...")
    const res = await fetch("https://calendar-dashboard-psi.vercel.app/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body)
    })
    
    const data = await res.json()
    console.log("Response:", JSON.stringify(data))
    
    console.log("Sending GET Request...")
    const res2 = await fetch("https://calendar-dashboard-psi.vercel.app/api/settings")
    const data2 = await res2.json()
    console.log("GET Response:", JSON.stringify(data2))
}

test()
