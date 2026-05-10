const s = "'689083'), ('04ebd9fc-45e8-4881-b26a-ca95cd4d28c7'";
const re = /(?=\),\s*\('04ebd9fc-45e8-4881-b26a-ca95cd4d28c7')/;
console.log(JSON.stringify(s.split(re)));
