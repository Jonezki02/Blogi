import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDir = path.join(process.cwd(), "src/content/posts");

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDir);

  return fileNames
    .map((fileName) => {
      const slug = fileName.replace(".md", "");
      const fullPath = path.join(postsDir, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const plainText = content.replace(/[#*_\-\[\]]/g, "");
      const snippet =
        plainText.length > 150
          ? plainText.substring(0, 150) + "..."
          : plainText;

      return {
        slug,
        fileName,
        data,
        snippet,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateB.getTime() - dateA.getTime();
    });
}

export async function getPost(fileName: string) {
  const slug = fileName.replace(".md", "");

  const fullPath = path.join(postsDir, fileName);

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);

  return {
    slug,
    data,
    contentHtml: processed.toString(),
  };
}
