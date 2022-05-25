import * as fs from 'fs';

export async function getBlogs() {
    const dir = fs.opendirSync('blogs')
    const blogs: string[] = []
    for await (const dirnet of dir) {
        blogs.push(dirnet.name)
    }
    return blogs
}

export async function getBlogContent(name: string): Promise<[string]> {
    const content = fs.readFileSync(`blogs/${name}`, 'utf8')
    return [content]
}

// T extends U ? X : Y
// 如果 T 能赋值给 U，返回 X，否则返回 Y
export type UnPromisify<T> = T extends Promise<infer U> ? U : T;
export type AnyFunc = (...args: any) => any;
export type AsyncFuncReturnType<T extends AnyFunc> = UnPromisify<ReturnType<T>>;