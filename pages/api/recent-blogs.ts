// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Blog, getBlogs } from '../../util';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Blog[]>) {
  res.status(200).json(await getBlogs());
}
