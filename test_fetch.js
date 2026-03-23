import fs from 'fs';
import https from 'https';

const icalUrl = "https://calendar.google.com/calendar/ical/c_0c91d774302be8eee34953d4a77020a9203a8a6056ab2ca07e19e63432d1c7dd%40group.calendar.google.com/private-5ef2ed9191e2a52e15fedc4e5368f7a4/basic.ics";

https.get(icalUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log("--- DOWNLOADED ICS DATA START ---");
        // Print the first 1000 characters to see the raw text format
        console.log(data.substring(0, 1000));
        console.log("--- DOWNLOADED ICS DATA END ---");
        fs.writeFileSync('test.ics', data);
        console.log('Saved to test.ics');
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
