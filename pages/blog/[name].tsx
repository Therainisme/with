import React from 'react';
import { AsyncFuncReturnType, getBlogs } from '../../util';
import style from "../../styles/blog/index.module.css";
import MyHead from '../../components/MyHead';

// parse markdown
import { renderToString } from 'react-dom/server';
import matter from "gray-matter";
import { evaluateSync } from '@mdx-js/mdx';
import * as fs from 'fs';
import * as runtime from 'react/jsx-runtime';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkAdmonitions from '../../util/remark-plugin';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
// @ts-ignore 
import rehypeKatex from 'rehype-katex';
// @ts-ignore
import rehypeStringify from 'rehype-stringify';


type Props = AsyncFuncReturnType<typeof getStaticProps>['props'];
type Params = AsyncFuncReturnType<typeof getStaticPaths>['paths'][0];

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
  const file = fs.readFileSync(`blogs/${params.name}`);

  // https://mdxjs.com/packages/mdx/#evaluatefile-options
  const { default: MDXContent } = evaluateSync(
    file,
    {
      ...runtime as any,
      remarkPlugins: [
        remarkFrontmatter,

        remarkDirective, remarkAdmonitions,

        remarkParse, remarkMath, remarkRehype, rehypeKatex, rehypeStringify,
      ],
    },
  );

  // 这里可以传 Props: MDXContent(props)
  const html = renderToString(MDXContent({}));

  // https://github.com/jonschlinkert/gray-matter#what-does-this-do
  const frontmatter = matter(file).data;

  return {
    props: {
      name: params.name,
      html,
      title: frontmatter.title,
    }
  };
}

export default function Blog(props: Props) {
  const { name, html, title } = props;

  return (
    <div>
      <MyHead title={`${name} - blog`} />
      <div className={style.container}>
        <div className={`${style.markdown} markdown-body`}>
          <h1>{title}</h1>
          <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </div>
      </div>
    </div>
  );
}