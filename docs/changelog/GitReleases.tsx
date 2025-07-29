import React, { useState, useEffect } from "react";

interface Release {
  id: number;
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

const GitReleases: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        // 检查是否有缓存的数据
        const cacheKey = "github_releases_cache";
        const cacheTimeKey = "github_releases_cache_time";
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const cachedData = localStorage.getItem(cacheKey);

        // 如果缓存存在且未过期（5分钟内），使用缓存数据
        if (cacheTime && cachedData && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          setReleases(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await fetch("https://api.github.com/repos/virzs/zs_library/releases?per_page=10", {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "zs_library-docs",
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            // 如果是速率限制错误，尝试使用缓存数据
            if (cachedData) {
              setReleases(JSON.parse(cachedData));
              setError("GitHub API 速率限制，显示缓存数据");
            } else {
              throw new Error("GitHub API 速率限制超出，请稍后重试");
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } else {
          const data = await response.json();
          // 过滤掉草稿版本
          const filteredReleases = data.filter((release: Release) => !release.draft);
          setReleases(filteredReleases);
          // 缓存数据
          localStorage.setItem(cacheKey, JSON.stringify(filteredReleases));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        }
      } catch (err) {
        console.error("Error fetching releases:", err);
        // 尝试使用缓存数据作为降级方案
        const cachedData = localStorage.getItem("github_releases_cache");
        if (cachedData) {
          setReleases(JSON.parse(cachedData));
          setError("获取最新数据失败，显示缓存数据");
        } else {
          setError(err instanceof Error ? err.message : "获取发布记录失败，请稍后重试");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>正在加载发布记录...</div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#ef4444" }}>{error}</div>;
  }

  if (!releases.length) {
    return <div style={{ padding: "20px", textAlign: "center" }}>暂无发布记录</div>;
  }

  return (
    <div>
      {releases.map((release) => {
        const date = new Date(release.published_at).toLocaleDateString("zh-CN");
        const isPrerelease = release.prerelease;

        return (
          <div
            key={release.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid #e1e5e9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#0969da",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  {release.name || release.tag_name}
                </a>
                {isPrerelease && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#d1a72e",
                      backgroundColor: "#fff8c5",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      border: "1px solid #d1a72e",
                    }}
                  >
                    预发布
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#656d76",
                }}
              >
                {release.tag_name}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#656d76",
                marginBottom: release.body ? "8px" : "0",
              }}
            >
              发布于 {date}
            </div>
            {release.body && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#24292f",
                  lineHeight: "1.5",
                  whiteSpace: "pre-line",
                }}
              >
                {release.body.length > 200 ? `${release.body.substring(0, 200)}...` : release.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GitReleases;
