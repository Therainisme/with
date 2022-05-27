import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as fs from 'fs';
import { AsyncFuncReturnType, getBlogContent, getBlogs } from '../util';
import style from "../styles/index.module.css";

type Props = AsyncFuncReturnType<typeof getStaticProps>['props'];

export async function getStaticProps() {
  const blogsName = await getBlogs();
  const blogsFormatter: Map<string, string>[] = [];
  for (const name of blogsName) {
    const [_, formatter] = await getBlogContent(name);
    blogsFormatter.push(formatter);
  }

  return {
    props: {
      blogs: blogsName.map((name, idx) => {
        return {
          name,
          title: blogsFormatter[idx].get('title'),
          date: blogsFormatter[idx].get('date'),
        };
      })
    }
  };
}

export default function Home(props: Props) {
  return (
    <div>
      <Head>
        <title>with.vivy.host</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={style.main}>
        <div className={style.container}>
          <h1>Therainisme</h1>
          <p>there is nothing holding me back</p>
          <hr />
          {
            props.blogs
              .sort((a, b) => b.date!.localeCompare(a.date!))
              .map((blog) => (
                <Link key={blog.title} href={`/blog/${blog.name}`}>
                  <h3 className={style.blog}>
                    <a>{blog.title}</a>
                    <time>{blog.date}</time>
                  </h3>
                </Link>
              ))
          }
        </div>
      </main>

    </div>
  );
}
