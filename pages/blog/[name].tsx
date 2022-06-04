import React from 'react';
import { AsyncFuncReturnType, getBlogs } from '../../util';
import style from "../../styles/blog/[name].module.scss";
import MyHead from '../../components/MyHead';
import Link from 'next/link';

// parse markdown
import { renderToString } from 'react-dom/server';
import matter from "gray-matter";
import { compileSync, createProcessor, evaluateSync } from '@mdx-js/mdx';
import * as fs from 'fs';
import * as runtime from 'react/jsx-runtime';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkAdmonitions from '../../util/remark-plugin';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// @ts-ignore 
import rehypeKatex from 'rehype-katex';
// @ts-ignore
import rehypeStringify from 'rehype-stringify';

type Props = AsyncFuncReturnType<typeof getStaticProps>['props'];
type Params = AsyncFuncReturnType<typeof getStaticPaths>['paths'][0];

const remarkOptions = {
  ...runtime as any,

  // https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins
  remarkPlugins: [
    // support frontmatter (yaml, toml, and more)
    remarkFrontmatter,

    // new syntax for directives (generic extensions)
    remarkDirective, remarkAdmonitions,

    // new syntax for math (new node types, rehype compatible)
    remarkParse, remarkMath, remarkRehype, rehypeKatex, rehypeStringify,

    // support GFM (autolink literals, footnotes, strikethrough, tables, tasklists)
    remarkGfm,
  ],

  // https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins
  rehypePlugins: [
    // highliht code blocks
    [rehypeHighlight],

    // auto link headings
    [rehypeSlug], [rehypeAutolinkHeadings, { behavior: 'append' }],
  ],
};

export async function getStaticPaths() {
  const blogs = await getBlogs();

  return {
    paths: [
      ...blogs.map((blog) => {
        return {
          params: {
            name: blog.file
          }
        };
      }),
    ],
    fallback: false, // 没有匹配的 path，返回 404
  };
}

export async function getStaticProps({ params }: Params) {
  const recentBlogs = await getBlogs();

  const file = fs.readFileSync(`blogs/${params.name}`);

  // https://mdxjs.com/packages/mdx/#evaluatefile-options
  const { default: MDXContent } = evaluateSync(file, remarkOptions);

  // 这里可以传 Props: MDXContent(props)
  const html = renderToString(MDXContent({}));

  // https://github.com/jonschlinkert/gray-matter#what-does-this-do
  const frontmatter = matter(file).data;

  return {
    props: {
      name: params.name,
      html,
      title: frontmatter.title,
      recentBlogs
    }
  };
}

export default function Blog(props: Props) {
  const { name, html, title, recentBlogs } = props;

  return (
    <div>
      <MyHead title={`${title} - blog`} />
      <div className={style.container}>
        <div className={style.sidebar}>
          <h2>Recent</h2>
          <ul>
            {recentBlogs.map((blog) => (
              <li key={blog.file} className={blog.file === name ? style.sidebarItemActive : ''}>
                <Link href={`/blog/${blog.file}`}>
                  {blog.title}
                </Link>
              </li>
            ))}
          </ul>

        </div>
        <div className={`${style.markdown} markdown-body`}>
          <h1>{title}</h1>
          <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </div>
        <div className={style.sidebar}>
          <h2>Catalog</h2>
          <ul>
            <li>
              <a>现在这个目录是一个假目录</a>
            </li>
            <li>
              <a>现在这个目录是一个假目录</a>
            </li>
            <li>
              <a>现在这个目录是一个假目录</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}