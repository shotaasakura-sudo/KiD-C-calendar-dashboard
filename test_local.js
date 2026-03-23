async function test() {
    try {
        console.log("Sending GET Request to localhost...");
        const res2 = await fetch("http://localhost:3000/api/settings");
        const data2 = await res2.json();
        console.log("GET Response (/api/settings):", JSON.stringify(data2));

        console.log("Sending GET Request to Calendar API...");
        const res3 = await fetch("http://localhost:3000/api/calendar");
        const data3 = await res3.json();
        console.log("GET Response (/api/calendar) event count:", data3.events ? data3.events.length : "undefined");
        if(data3.events && data3.events.length > 0) {
            console.log("Sample event:", data3.events[0]);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
