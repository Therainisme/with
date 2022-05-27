import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AsyncFuncReturnType, getBlogContent, getBlogs } from '../../util';
import { compileMarkdown } from '../../util/md';
import style from "../../styles/blog/index.module.css";
import MyHead from '../../components/MyHead';


type Props = AsyncFuncReturnType<typeof getStaticProps>['props'];
type Params = AsyncFuncReturnType<typeof getStaticPaths>['paths'][0];

export async function getStaticPaths() {
  const blogs = await getBlogs();

  return {
    paths: [
      ...blogs.map((name) => {
        return { params: { name } };
      }),
    ],
    fallback: false, // 没有匹配的 path，返回 404
  };
}

export async function getStaticProps({ params }: Params) {
  const [content] = await getBlogContent(params.name);

  const [html, formatter] = compileMarkdown(content);
  const [title, date] = [
    formatter.get('title'),
    formatter.get('date'),
  ];

  return {
    props: {
      name: params.name,
      html,
      title,
      date,
    }
  };
}

export default function Blog(props: Props) {
  const { title, date } = props;

  return (
    <div>
      <MyHead title={`${title} - blog`} />
      <div className={style.container}>
        <div className={`${style.markdown} markdown-body`}>
          {title ? <h1>{title}</h1> : ""}
          {date ? <p>{date}</p> : ""}
          <div dangerouslySetInnerHTML={{ __html: props.html }}></div>
        </div>
      </div>
    </div>
  );
}