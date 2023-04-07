import fs from 'fs-extra';
import * as path from 'path';
import { marked } from 'marked';
import { load } from 'cheerio';

// import fetch from 'node-fetch';
// import { type IWikiPage } from './types';


// Remove any null values from the object
export const removeNullValues = (obj: {[key: string]: any}): void => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === null) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      removeNullValues(obj[key]);
    }
  });
};


export const scanDir = (directoryPath: string, filesList: string[] = []): string[] => {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isFile()) {
      filesList.push(path.relative(process.cwd(), filePath));
    } else if (fileStat.isDirectory() && file !== '.git') {
      console.log('file', file);
      scanDir(filePath, filesList);
    }
  }

  return filesList;
};


interface MarkdownData {
  title: string;
  content: string | null;
  token: string | null;
}

export const markdownToJSON = (filePath: string): MarkdownData => {
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const html = marked(markdown);
  const $ = load(html);

  console.log('html', html);
  // console.log('$', $.parseHTML(html));
  const title = $('h1').text();
  const content = $('article').html();
  const token = $('token').html();
  const asdf = $.parseHTML(html);
  console.log('asdf', asdf);

  console.log('title', title);
  console.log('content', content);
  console.log('token', token);

  return { title, content, token };
};

// export const getWikiPageRawText = async (url: string): Promise<string> => {
//   const response = await fetch(url);

//   if (!response.ok) {
//     throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
//   }

//   return await response.text();
// };


// export  const getWikiPages = async (owner: string, repo: string, token: string): Promise<IWikiPage[]> => {
//   const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
//     headers: {
//       Authorization: `token ${token}`
//     }
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to fetch wiki pages: ${response.status} ${response.statusText}`);
//   }

//   const json = await response.json();

//   return json.tree
//     .filter((node: any) => node.type === 'blob' && node.path.startsWith('wiki/'))
//     .map((node: any) => ({
//       name: node.path.replace(/^wiki\//, ''),
//       path: node.path,
//       sha: node.sha,
//       url: `https://github.com/${owner}/${repo}/wiki/${node.path.replace(/\.md$/, '')}`
//     }));
// }
