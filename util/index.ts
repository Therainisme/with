import * as fs from 'fs';
import matter from 'gray-matter';

type Blog ={
    title: string;
    file: string;
    date: string;
}

export async function getBlogs() {
    const dir = fs.opendirSync('blogs');
    const blogs: Blog[] = [];
    for await (const dirnet of dir) {
        const content = fs.readFileSync(`blogs/${dirnet.name}`, 'utf8');
        const frontmatter = matter(content);
        blogs.push({
            title: frontmatter.data.title,
            file: dirnet.name,
            date: frontmatter.data.date
        });
    }
    return blogs;
}

// T extends U ? X : Y
// 如果 T 能赋值给 U，返回 X，否则返回 Y
export type UnPromisify<T> = T extends Promise<infer U> ? U : T;
export type AnyFunc = (...args: any) => any;
export type AsyncFuncReturnType<T extends AnyFunc> = UnPromisify<ReturnType<T>>;