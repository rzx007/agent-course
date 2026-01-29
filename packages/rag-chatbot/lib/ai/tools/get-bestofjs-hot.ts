import { load } from "cheerio";
import { tool } from "ai";
import { z } from "zod";

const BASE_URL = "https://bestofjs.org";

/**
 * 解析 bestofjs.org 首页 Hot Projects 区块。
 * 依赖 bestofjs.org 首页 Hot Projects 表格的 DOM 结构（tr[data-testid="project-card"]）。
 */
function parseHotProjects(html: string, limit: number) {
  const $ = load(html);
  const rows = $('tr[data-testid="project-card"]');
  const projects: Array<{
    name: string;
    url: string;
    description?: string;
    starsDelta: string;
    tags?: string[];
    githubUrl?: string;
    homepage?: string;
  }> = [];

  for (let i = 0; i < Math.min(rows.length, limit); i++) {
    const row = $(rows[i]);
    const projectLink = row
      .find('a[href^="/projects/"]')
      .filter((_, el) => {
        const h = $(el).attr("href") ?? "";
        return /^\/projects\/[^/?]+$/.test(h);
      })
      .first();
    const href = projectLink.attr("href");
    if (!href) continue;

    const name =
      row.find("img.project-logo").attr("alt")?.trim() ||
      projectLink.text().trim() ||
      "";
    const url = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    const lineClamp = row.find(".line-clamp-2, .line-clamp-3").first();
    const description = lineClamp.text().trim() || undefined;

    const starsMatch = row.text().match(/\+\d+(\.\d+)?[kK]?|\d+[kK]?\s*star/);
    const starsDelta = starsMatch ? starsMatch[0].replace(/\s*star.*/i, "").trim() : "";

    const tagLinks = row.find('a[href*="tags="]');
    const tags: string[] = [];
    tagLinks.each((_, el) => {
      const t = $(el).text().trim();
      if (t) tags.push(t);
    });

    const githubLink = row.find('a[href^="https://github.com/"]').first().attr("href");
    const homeLink = row
      .find('a[href^="http"]')
      .filter((_, el) => {
        const h = $(el).attr("href") ?? "";
        return h.startsWith("https://github.com/") ? false : true;
      })
      .first()
      .attr("href");

    projects.push({
      name,
      url,
      ...(description && { description }),
      starsDelta: starsDelta || "—",
      ...(tags.length > 0 && { tags }),
      ...(githubLink && { githubUrl: githubLink }),
      ...(homeLink && homeLink !== url && { homepage: homeLink }),
    });
  }

  return projects;
}

export const getBestOfJsHot = tool({
  description:
    "获取 bestofjs.org 首页 Hot Projects（按昨日新增 star 排序），用于查看当下最热门的开源项目与 Web/JS/TS 生态趋势。返回项目名、链接、描述、star 变化、标签等结构化数据。",
  inputSchema: z.object({
    limit: z
      .number()
      .min(1)
      .max(30)
      .default(10)
      .describe("返回的热门项目数量，默认 10"),
  }),
  needsApproval: false,
  execute: async (input) => {
    try {
      const response = await fetch(BASE_URL + "/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; bestofjs-bot/1.0; +https://github.com/bestofjs/bestofjs)",
        },
      });

      if (!response.ok) {
        return {
          error: `请求 bestofjs.org 失败，HTTP 状态码：${response.status}`,
        };
      }

      const html = await response.text();
      const projects = parseHotProjects(html, input.limit);

      if (projects.length === 0) {
        return {
          error:
            "未能从页面解析出 Hot Projects，bestofjs.org 可能已改版，请稍后重试。",
        };
      }

      return {
        source: "bestofjs.org",
        section: "hot",
        description: "By stars added yesterday",
        projects,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: `获取 Best of JS 热门项目时发生异常：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
