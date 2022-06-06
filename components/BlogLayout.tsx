import Link from "next/link";
import MyHead from "./MyHead";
import style from "../styles/blog/BlogLayout.module.scss";
import { useEffect, useRef, useState } from "react";
import { Blog } from '../util';

type Props = {
  title: string;
  date: string;
  recentBlogs: Blog[];
  children: React.ReactNode;
};

const dev = process.env.NODE_ENV !== 'production';

export const server = dev ? 'http://localhost:3000' : 'https://with.vivy.host';

export function withGetStaticProps(title: string, date: string) {
  return async () => {
    const response = await fetch(`${server}/api/recent-blogs`);
    const recentBlogs = await response.json();

    return {
      props: {
        title,
        date,
        recentBlogs: recentBlogs,
      }
    };
  };
}

export function BlogLayout(props: Props) {

  const { title, recentBlogs, children } = props;

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
  }, [title]);

  return (
    <div>
      <MyHead title={`${title} - blog`} />
      <div className={style.container}>
        <div className={style.sidebar}>
          <h2>Recent</h2>
          <ul>
            {recentBlogs?.map((blog) => (
              <li key={blog.path} className={blog.title === title ? style.sidebarItemActive : ''}>
                <Link href={blog.path}>
                  {blog.title}
                </Link>
              </li>
            ))}
          </ul>

        </div>
        <div className={`${style.markdown} markdown-body`}>
          <h1>{title}</h1>
          <div ref={contentRef}>
            {children}
          </div>
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

// component end

type Heading = {
  id: string;
  content: string;
  depth: number;
  subHeading?: Heading[];
};

function headingArrayMapToCatalog(headings: Heading[]): any {
  return headings?.map((item) => {
    return (
      <span key={`${item.id}${item.content}${item.depth}`}>
        <li className={style.catalogItem} style={{ marginLeft: (item.depth - 2) * 20 }}>
          <a href={`#${item.id}`}>{item.content}</a>
        </li>
        {item.subHeading && headingArrayMapToCatalog(item.subHeading)}
      </span>
    );
  });
}