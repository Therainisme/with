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