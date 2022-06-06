import nextMDX from '@next/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import { remarkAdmonitions } from './util/remark-plugin.mjs';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
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
  },
});

export default withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});