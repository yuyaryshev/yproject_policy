const tsj = require("ts-json-schema-generator");
const fs = require("fs");

const config = {
    path: "./src/types/api/AckPacket.ts",
    tsconfig: "./tsconfig.json",
    type: "*",
};

const output_path = "./src/types/api/json_schema.json";

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, null, 2);
fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
});

console.log(`YYA Also check 'npm run build:validators'`);