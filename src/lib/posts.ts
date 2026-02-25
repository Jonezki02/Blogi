import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDir = path.join(process.cwd(), "src/content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  snippet: string;
  content?: string;
  contentHtml?: string;
}

export function getAllPosts(): Post[] {
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
        title: data.title,
        date: data.date
          ? new Date(data.date).toISOString()
          : new Date().toISOString(),
        snippet,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
}

export async function getPost(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);

  const plainText = content.replace(/[#*_\-\[\]]/g, "");
  const snippet =
    plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;

  return {
    slug,
    title: data.title || "Nimetön",
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    snippet,
    content,
    contentHtml: processed.toString(),
  };
}

export function createPost(
  slug: string,
  title: string,
  date: string,
  content: string,
): boolean {
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const fullPath = path.join(postsDir, `${slug}.md`);

  if (fs.existsSync(fullPath)) {
    return false;
  }

  fs.writeFileSync(
    fullPath,
    `---\ntitle: "${title}"\ndate: ${date}\n---\n\n${content}\n`,
    "utf8",
  );

  return true;
}

export function getRawPost(
  slug: string,
): { slug: string; title: string; date: string; content: string } | null {
  const fullPath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || "",
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
    content: content.trim(),
  };
}

export function updatePost(
  slug: string,
  title: string,
  date: string,
  content: string,
): boolean {
  const fullPath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  fs.writeFileSync(
    fullPath,
    `---\ntitle: "${title}"\ndate: ${date}\n---\n\n${content}\n`,
    "utf8",
  );

  return true;
}

export function deletePost(slug: string): boolean {
  const fullPath = path.join(postsDir, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  fs.unlinkSync(fullPath);

  return true;
}
