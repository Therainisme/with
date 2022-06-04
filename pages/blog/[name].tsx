import React, { useEffect, useRef, useState } from 'react';
import { AsyncFuncReturnType, getBlogs } from '../../util';
import style from "../../styles/blog/[name].module.scss";
import MyHead from '../../components/MyHead';
import Link from 'next/link';

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
      ...blogs
        .map((blog) => {
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
      recentBlogs: recentBlogs.sort((a, b) => b.date!.localeCompare(a.date!)),
    }
  };
}

export default function Blog(props: Props) {
  const { name, html, title, recentBlogs } = props;

  const contentRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState<Heading[]>([]);

  // 生成侧边目录
  useEffect(() => {
    const root = contentRef.current;
    if (!root || !root.firstChild) return;


    let el = root.firstChild;
    /** 
     * 迭代器：获取下一个 Heading
    */
    function headingElementIterator() {
      if (!el.previousSibling && (el.nodeName === "H2" || el.nodeName === "H3" || el.nodeName === "H4")) {
        const returnEl = el;
        if (el.nextSibling) el = el.nextSibling;
        return returnEl;
      }

      do {
        if (!el.nextSibling) return null;
        el = el.nextSibling;
      } while (!(el.nodeName === "H2" || el.nodeName === "H3" || el.nodeName === "H4"));

      return el;
    }

    /**
     * 超前查看下一个 Heading
     */
    function getNextHeading(el: ChildNode): ChildNode | null {
      let rtEl = el;

      do {
        if (!rtEl.nextSibling) return null;
        rtEl = rtEl.nextSibling;
      } while (!(rtEl.nodeName === "H2" || rtEl.nodeName === "H3" || rtEl.nodeName === "H4"));

      return rtEl;
    }

    /**
     * 转换深度 (HX) => X
     */
    function getHeadingDepth(nodeName: string): number {
      switch (nodeName) {
        case "H2":
          return 2;
        case "H3":
          return 3;
        case "H4":
          return 4;
        default:
          return -1;
      }
    }

    // 递归建树
    function buildSubHeading(father: Heading, depth: number, HeadingIterator: () => ChildNode | null) {
      let it: ChildNode | null;
      do {
        it = HeadingIterator();
        if (!it) return;

        father.subHeading!.push({
          // @ts-ignore
          id: it.getAttribute('id'),
          content: it.textContent!,
          depth,
          subHeading: []
        });

        // 超前检测下一个 Heading
        const nextHeading = getNextHeading(it);
        if (!nextHeading) return;
        if (getHeadingDepth(nextHeading.nodeName) > depth) {
          // 构建子目录
          buildSubHeading(father.subHeading![father.subHeading!.length - 1], depth + 1, HeadingIterator);
        } else if (getHeadingDepth(nextHeading.nodeName) < depth) {
          // 停止递归
          return;
        }

      } while (getHeadingDepth(it.nodeName) === depth);
    }

    const rootHeading: Heading = { id: "-1", content: 'root heading', depth: 1, subHeading: [] };
    buildSubHeading(rootHeading, 2, headingElementIterator);

    setCatalog(rootHeading.subHeading ? rootHeading.subHeading : []);
  }, [name]);

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
          <div ref={contentRef} dangerouslySetInnerHTML={{ __html: html }}></div>
        </div>
        <div className={style.sidebar}>
          <h2>Catalog</h2>
          <ul>
            {headingArrayMapToCatalog(catalog)}
          </ul>
        </div>
      </div>
    </div>
  );
}

type Heading = {
  id: string;
  content: string;
  depth: number;
  subHeading?: Heading[];
};

function headingArrayMapToCatalog(headings: Heading[]): any {
  return headings.map((item) => {
    return (
      <>
        <li className={style.catalogItem} key={item.content + item.depth} style={{ marginLeft: (item.depth - 2) * 20 }}>
          <a href={`#${item.id}`}>{item.content}</a>
        </li>
        {item.subHeading && headingArrayMapToCatalog(item.subHeading)}
      </>
    );
  });
}