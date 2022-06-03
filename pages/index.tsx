import Link from 'next/link';
import { AsyncFuncReturnType, getBlogs } from '../util';
import style from "../styles/index.module.css";
import MyHead from '../components/MyHead';

type Props = AsyncFuncReturnType<typeof getStaticProps>['props'];

export async function getStaticProps() {
  const blogs = await getBlogs();

  return {
    props: {
      blogs
    }
  };
}

export default function Home(props: Props) {
  return (
    <div>
      <MyHead title="with.vivy.host" />
      <main className={style.main}>
        <div className={style.container}>
          <h1>Therainisme</h1>
          <p>{"there's nothing holding me back"}</p>
          <hr />
          {
            props.blogs
              .sort((a, b) => b.date!.localeCompare(a.date!))
              .map((blog) => (
                <Link key={blog.title} href={`/blog/${blog.file}`}>
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
