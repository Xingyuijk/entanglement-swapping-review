# 纠缠交换与量子 memory 纠缠进展网站

这是本项目的纯静态可部署站点。入口为 `index.html`，基础节点数据在 `data.js`，条件特定的效率与实验机制在 `metadata.js`，不依赖构建工具或外部 CDN。

## 本地预览

在本目录启动任意静态 HTTP server，例如：

```bash
python3 -m http.server 8765
```

浏览器打开 `http://localhost:8765/`。直接双击 HTML 也可查看，但部分浏览器会限制相对链接或本地脚本。

## 数据口径

节点对应一篇论文；`-` 表示原文/当前证据卡片没有同条件参数。`memoryEfficiency` 与 `interfaceEfficiency` 分开，避免把 AFC/QFC/探测效率误写成 memory efficiency。`distanceType` 区分独立节点、deployed fibre、coiled spool 和 fiber path。SPI/TPI 指标分栏呈现，不做跨定义排名。关系边只表示协议继承、参数提升、硬件改进或应用扩展。

证据主表见 `../output/entanglement_swapping_progress_1993_2026.md`，逐条卡片见 `../sources/cards/entanglement_swapping_landmarks_1993_2026.md`。
