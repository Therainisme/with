import * as fs from 'fs';

export type Blog = {
    title: string;
    path: string;
    date: string;
};

export async function getBlogs() {
    const dir = fs.opendirSync('pages/blog');
    const blogs: Blog[] = [];

    for await (const dirnet of dir) {
        const component = require(`../pages/blog/${dirnet.name}`);

        blogs.push({
            title: component.title,
            path: `/blog/${dirnet.name.slice(0, -4)}`,
            date: component.date
        });
    }
    return blogs;
}

// T extends U ? X : Y
// 如果 T 能赋值给 U，返回 X，否则返回 Y
export type UnPromisify<T> = T extends Promise<infer U> ? U : T;
export type AnyFunc = (...args: any) => any;
export type AsyncFuncReturnType<T extends AnyFunc> = UnPromisify<ReturnType<T>>;