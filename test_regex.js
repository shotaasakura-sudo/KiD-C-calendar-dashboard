const text = "説明文のテストです。\n#社内ミーティング\nよろしくお願いいたします。";
const regex = /#([^\s　#,。、\n]+)/;

const match = text.match(regex);
console.log("Match:", match ? match[1] : "null");

const text2 = "#社内ミーティング です。";
const match2 = text2.match(regex);
console.log("Match2:", match2 ? match2[1] : "null");

const text3 = "テスト\n\n#打合せ\n\nテスト";
const match3 = text3.match(regex);
console.log("Match3:", match3 ? match3[1] : "null");
