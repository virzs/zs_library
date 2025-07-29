import React, { useState, useEffect } from "react";

interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

const GitCommits: React.FC = () => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        // 检查是否有缓存的数据
        const cacheKey = "github_commits_cache";
        const cacheTimeKey = "github_commits_cache_time";
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const cachedData = localStorage.getItem(cacheKey);

        // 如果缓存存在且未过期（5分钟内），使用缓存数据
        if (cacheTime && cachedData && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          setCommits(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await fetch("https://api.github.com/repos/virzs/zs_library/commits?per_page=20", {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "zs_library-docs",
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            // 如果是速率限制错误，尝试使用缓存数据
            if (cachedData) {
              setCommits(JSON.parse(cachedData));
              setError("GitHub API 速率限制，显示缓存数据");
            } else {
              throw new Error("GitHub API 速率限制超出，请稍后重试");
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } else {
          const data = await response.json();
          setCommits(data);
          // 缓存数据
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        }
      } catch (err) {
        console.error("Error fetching commits:", err);
        // 尝试使用缓存数据作为降级方案
        const cachedData = localStorage.getItem("github_commits_cache");
        if (cachedData) {
          setCommits(JSON.parse(cachedData));
          setError("获取最新数据失败，显示缓存数据");
        } else {
          setError(err instanceof Error ? err.message : "获取提交记录失败，请稍后重试");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>正在加载提交记录...</div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#ef4444" }}>{error}</div>;
  }

  if (!commits.length) {
    return <div style={{ padding: "20px", textAlign: "center" }}>暂无提交记录</div>;
  }

  // 过滤掉merge commit
  const filteredCommits = commits.filter((commit) => {
    const message = commit.commit.message.toLowerCase();
    return !message.startsWith("merge") && !message.includes("merge pull request");
  });

  return (
    <div>
      {filteredCommits.map((commit) => {
        const date = new Date(commit.commit.author.date).toLocaleDateString("zh-CN");
        const shortSha = commit.sha.substring(0, 7);
        const [firstLine] = commit.commit.message.split("\n");

        return (
          <div
            key={commit.sha}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #e1e5e9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4px",
              }}
            >
              <a
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#0969da",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {firstLine}
              </a>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#656d76",
                }}
              >
                {shortSha}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#656d76",
              }}
            >
              {commit.commit.author.name} · {date}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GitCommits;
