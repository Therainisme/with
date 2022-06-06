// import * as fs from "fs";

// @ts-ignore
const fs = require("fs");

const template = `export default {};
export const recentBlogs = ?;`;

async function getBlogs() {
    const dir = fs.opendirSync('pages/blog');
    let blogs: any[] = [];

    for await (const dirnet of dir) {
        const content = fs.readFileSync(`pages/blog/${dirnet.name}`);
        const titleReg = /export const title = "(.*?)"/g;
        const dateReg = /export const date = "(.*?)"/g;

        const title = titleReg.exec(content)![1];
        const date = dateReg.exec(content)![1];

        blogs.push({
            title,
            path: `/blog/${dirnet.name.slice(0, -4)}`,
            date
        });
    }
    return blogs;
}

async function run() {
    const recentBlogs = await getBlogs();
    fs.writeFileSync('util/navbar.ts', template.replace("?", JSON.stringify(recentBlogs)));
}

run();