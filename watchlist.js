/* Parallel 2026 branches cited by Luo/Xu 2026; kept separate from the ensemble-memory main line. */
window.ES_WATCHLIST = {
  papers: [
    {
      id: "lu2026_diqkd", year: 2026,
      title: "Device-independent quantum key distribution over 100 km with single atoms",
      short: "Lu 2026 DI-QKD", authors: "Lu et al.（Feihu Xu / Pan 团队）",
      venue: "Science 391, 592–597", doi: "10.1126/science.aec6243", arxiv: "2602.09596",
      memory: "single-atom memory", material: "⁸⁷Rb neutral atom", source: "Rydberg-based single-photon emission",
      protocol: "SPI / DI-QKD", efficiency: "QFC overall 47%", memoryEfficiency: "-",
      interfaceEfficiency: "780→1315 nm QFC 47%；single-photon collection/transmission/coupling约 4%",
      storage: "dynamical decoupling；clock-state extension >300 ms",
      spi: { p: "event rate 0.72 s⁻¹（11 km）", c: "-" }, tpi: { hom: "0.991±0.01（780 nm HOM）", p: "-", f: "0.947±0.005（11 km）；0.911±0.010（100 km）" },
      distance: "11–100 km fibre", distanceType: "spooled fibre; 11 km finite-key DI-QKD",
      applications: ["DI-QKD", "positive key to 100 km"],
      features: "Rydberg-based single-photon emission suppresses recoil/re-excitation without adding noise；11 km CHSH S=2.612±0.031，1.2 million heralded pairs，finite-size key 0.112 bits/event（0.06 bit/s）；100 km asymptotic key rate仍为正。",
      evidence: "Crossref/OpenAlex；arXiv 2602.09596v1 原文 pp. 1–6。",
      mechanism: "每个中性原子节点用 Rydberg single-photon emission 产生 780 nm photon，中央 Charlie 以 SPI single-click herald；PPLN QFC 转到 1315 nm，连续 FPGA feedback 稳定干涉相位，独立温控 enclosure 抑制慢漂移。",
      x: 1660, y: 285, scope: "parallel"
    },
    {
      id: "liu2026_ion", year: 2026,
      title: "Long-lived remote ion–ion entanglement for scalable quantum repeaters",
      short: "Liu 2026 ion–ion", authors: "W.-Z. Liu et al.（Feihu Xu / Pan 团队）",
      venue: "Nature 652, 51–57", doi: "10.1038/s41586-026-10177-4", arxiv: "2602.08472",
      memory: "trapped-ion memory", material: "⁴⁰Ca⁺", source: "single-photon emission + PPLN QFC",
      protocol: "SPEP / SPI / DI-QKD", efficiency: "QFC combined transmission 28%", memoryEfficiency: "-",
      interfaceEfficiency: "pre-QFC photon efficiency 2.6%/2.8%；10 km link efficiency 9.1%",
      storage: "550±36 ms coherence；average generation time 450 ms",
      spi: { p: "2.226 cps（α=17%）", c: "-" }, tpi: { hom: "-", p: "-", f: "0.923±0.012 / 0.910±0.012" },
      distance: "10 km fibre；asymptotic 101 km", distanceType: "metropolitan link / fibre spool",
      applications: ["DI-QKD", "repeater building block", "entanglement purification/swapping"],
      features: "long-lived ion–ion memory entanglement survives longer than its establishment time；10 km distills 1,917 secret bits from 4.05×10⁵ Bell pairs，101 km asymptotic key rate 0.0974 per round。",
      evidence: "Crossref/OpenAlex；arXiv 2602.08472v1 原文 pp. 1–9。",
      mechanism: "40Ca⁺ ion 的 single-photon emission protocol（SPEP）用相位参考光和 1548/1550 nm optical phase lock稳定两节点；393/729 nm Raman transfer 把 entanglement 转入 long-lived S1/2 memory，KDD dynamical decoupling 抵抗磁场噪声；PPLN QFC将 393 nm 转到 telecom。",
      x: 1660, y: 385, scope: "parallel"
    }
  ],
  edges: [["luo2026", "lu2026_diqkd", "application"], ["knaut2024", "liu2026_ion", "hardware"], ["stolk2024", "liu2026_ion", "application"]]
};
