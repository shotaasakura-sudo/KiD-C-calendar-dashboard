import fs from 'fs';

const data = fs.readFileSync('test.ics', 'utf8');

const regex = /#([^\s　#,。、\n]+)/g;

const lines = data.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('DESCRIPTION:')) {
        console.log(`\nLine ${i + 1}: ${line}`);
        
        const match = line.match(/#([^\s　#,。、\n\r]+)/);
        if (match) {
            console.log(`Matched: ${match[1]}`);
        } else {
            console.log(`No match.`);
            // check if there is a hash
            if (line.includes('#')) {
                console.log('Contains hash but no match.');
                console.log('Character codes around hash:');
                const hashIndex = line.indexOf('#');
                for (let j = Math.max(0, hashIndex - 2); j < Math.min(line.length, hashIndex + 5); j++) {
                    console.log(`'${line[j]}' : ${line.charCodeAt(j)}`);
                }
            }
        }
    }
}
