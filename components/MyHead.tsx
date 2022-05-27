import Head from "next/head";

type Props = {
    title: string;
    meta?: { name: string, content: string; }[];
};

export default function MyHead(props: Props) {
    return (
        <Head>
            <title>{props.title}</title>
            <meta name="description" content="这里写着的肯定是一堆废话，如果我这里不写废话的话，那么废话就没有地方可写了。我真的一点话都编不出来了，谁来救救我告诉我这里应该写什么比较好。" />
            <meta name="keywords" content="blog,notebook,Therainisme,Algorithm,vivy,题解,算法,编程,笔记,学习,react" />
            <meta name="author" content="therainisme" />
            <meta name="google-site-verification" content="ZaAJSdtnYmcqtuSBVaWtY9WwP8xZu1QK0bRlmU8uJFk" />
            {props.meta?.map((meta) => (
                <meta key={meta.name} name={meta.name} content={meta.content} />
            ))}
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
}