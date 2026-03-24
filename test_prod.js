async function test() {
    try {
        const prodUrl = "https://calendar-dashboard-psi.vercel.app";
        console.log("Sending GET Request to Production...");
        
        console.log(`Fetching settings from ${prodUrl}/api/settings`);
        const res2 = await fetch(`${prodUrl}/api/settings`);
        const data2 = await res2.json();
        console.log("GET Response (/api/settings):", JSON.stringify(data2));

        console.log(`Fetching calendar from ${prodUrl}/api/calendar`);
        const res3 = await fetch(`${prodUrl}/api/calendar`);
        const data3 = await res3.json();
        console.log("GET Response (/api/calendar) event count:", data3.events ? data3.events.length : "undefined");
        if(data3.events && data3.events.length > 0) {
            console.log("Sample event:", data3.events[0]);
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}
test();
